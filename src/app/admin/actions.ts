'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { sendNotification, sendBulkNotifications } from '@/lib/notifications'
import { payoutApprovedEmail } from '@/lib/email'
import { sendEmail } from '@/lib/email'

// Prize tier splits (from PRD)
const TIER_SPLITS = { 5: 0.40, 4: 0.35, 3: 0.25 } as const
// Portion of monthly revenue allocated to the prize pool
const DRAW_ALLOCATION_PCT = 0.20 // 20% of subscription revenue

// ─────────────────────────────────────────────
// Calculate this month's prize pool from Stripe
// ─────────────────────────────────────────────
export async function calculatePrizePool(): Promise<{
  activeSubs: number
  pricePerSub: number
  totalRevenue: number
  drawAllocation: number
  basePool: number
  carryover: number
  finalPool: number
}> {
  const supabase = await createClient()

  const { count: activeSubs } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('subscription_status', ['active', 'trialing'])

  let pricePerSub = 0
  try {
    if (process.env.STRIPE_MONTHLY_PRICE_ID) {
      const price = await stripe.prices.retrieve(process.env.STRIPE_MONTHLY_PRICE_ID)
      pricePerSub = (price.unit_amount ?? 0) / 100
    }
  } catch {}

  const totalRevenue = (activeSubs || 0) * pricePerSub
  const basePool = totalRevenue * DRAW_ALLOCATION_PCT

  const { data: lastDraw } = await supabase
    .from('draws')
    .select('jackpot_carryover')
    .eq('status', 'published')
    .order('draw_year', { ascending: false })
    .order('draw_month', { ascending: false })
    .limit(1)
    .single()

  const carryover = (lastDraw as any)?.jackpot_carryover || 0
  const finalPool = basePool + carryover

  return {
    activeSubs: activeSubs || 0,
    pricePerSub,
    totalRevenue,
    drawAllocation: DRAW_ALLOCATION_PCT,
    basePool,
    carryover,
    finalPool,
  }
}

// ─────────────────────────────────────────────
// Simulate a draw for a given month/year
// ─────────────────────────────────────────────
export async function simulateDraw(
  mode: 'random' | 'most_frequent' | 'least_frequent',
  drawMonth: number,
  drawYear: number
) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('draws')
    .select('id, status')
    .eq('draw_month', drawMonth)
    .eq('draw_year', drawYear)
    .single()

  if (existing) {
    return { error: `A draw for ${drawMonth}/${drawYear} already exists (status: ${existing.status}). Delete it first if you need to re-run.` }
  }

  const poolData = await calculatePrizePool()
  let numbers: number[] = []

  if (mode === 'random') {
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
  } else {
    const { data: allScores } = await supabase.from('scores').select('score')
    if (!allScores || allScores.length === 0) {
      return { error: 'No scores in the database to run an algorithmic draw.' }
    }

    const freqs: Record<number, number> = {}
    allScores.forEach((s: any) => { freqs[s.score] = (freqs[s.score] || 0) + 1 })

    const sorted = Object.entries(freqs)
      .map(([score, count]) => ({ score: parseInt(score, 10), count }))
      .sort((a, b) => mode === 'most_frequent' ? b.count - a.count : a.count - b.count)

    for (const entry of sorted) {
      if (numbers.length >= 5) break
      if (!numbers.includes(entry.score)) numbers.push(entry.score)
    }

    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
  }

  numbers.sort((a, b) => a - b)

  const { error } = await supabase.from('draws').insert({
    mode,
    status: 'simulated',
    winning_numbers: numbers,
    draw_month: drawMonth,
    draw_year: drawYear,
    calculated_pool: poolData.finalPool,
    total_pool: poolData.finalPool,
    rollover_amount: poolData.carryover,
    draw_allocation_pct: DRAW_ALLOCATION_PCT * 100,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, poolData }
}

// ─────────────────────────────────────────────
// Publish a draw — matching + prize distribution
// ─────────────────────────────────────────────
export async function publishDraw(drawId: string) {
  const supabase = await createClient()

  const { data: draw, error: drawErr } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawErr || !draw) return { error: drawErr?.message || 'Draw not found' }
  if (draw.status === 'published') return { error: 'This draw has already been published.' }

  const winningNumbers = draw.winning_numbers as number[]
  const totalPool = Number(draw.total_pool) || 0
  const monthLabel = new Date(draw.draw_year, draw.draw_month - 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' })

  const tierPools = {
    5: totalPool * TIER_SPLITS[5],
    4: totalPool * TIER_SPLITS[4],
    3: totalPool * TIER_SPLITS[3],
  }

  // Get all users' scores
  const { data: allScores, error: scoreErr } = await supabase
    .from('scores')
    .select('id, user_id, score, date, created_at')
    .order('created_at', { ascending: false })

  if (scoreErr) return { error: scoreErr.message }

  type ScoreEntry = { score: number; date: string; created_at: string }
  const userGroups: Record<string, ScoreEntry[]> = {}
  ;(allScores || []).forEach((s: any) => {
    if (!userGroups[s.user_id]) userGroups[s.user_id] = []
    if (userGroups[s.user_id].length < 5) {
      userGroups[s.user_id].push({ score: s.score, date: s.date, created_at: s.created_at })
    }
  })

  // Fetch all user emails up front (one query)
  const allUserIds = Object.keys(userGroups)
  const { data: userProfiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', allUserIds)
  const emailByUserId: Record<string, string> = {}
  ;(userProfiles || []).forEach((p: any) => { emailByUserId[p.id] = p.email })

  // Bucket winners by tier
  const tierWinners: Record<number, string[]> = { 5: [], 4: [], 3: [] }
  for (const [userId, entries] of Object.entries(userGroups)) {
    if (entries.length < 5) continue
    const matchCount = entries.filter(e => winningNumbers.includes(e.score)).length
    if (matchCount >= 3) tierWinners[matchCount as 3 | 4 | 5].push(userId)
  }

  const winnersToInsert: any[] = []
  const notificationsToInsert: { user_id: string; title: string; message: string; ctaUrl?: string; ctaLabel?: string }[] = []

  // Winner notifications
  for (const tier of [5, 4, 3] as const) {
    const winners = tierWinners[tier]
    if (winners.length === 0) continue
    const prizePerWinner = tierPools[tier] / winners.length

    for (const userId of winners) {
      const entries = userGroups[userId]
      winnersToInsert.push({
        draw_id: drawId,
        user_id: userId,
        tier,
        prize_amount: parseFloat(prizePerWinner.toFixed(2)),
        status: 'pending',
        matched_score_entries: entries,
      })
      const submitUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard/winners`
      notificationsToInsert.push({
        user_id: userId,
        title: `🎉 You Won! (Match ${tier})`,
        message: `Congratulations! Your ticket matched ${tier} of the winning numbers [${winningNumbers.join(', ')}] in the ${monthLabel} draw! You've won ${winners.length > 1 ? `a ${winners.length}-way split of ` : ''}$${prizePerWinner.toFixed(2)}. Submit your scorecard proof here to get paid: ${submitUrl}`,
        ctaUrl: submitUrl,
        ctaLabel: '📎 Submit Your Proof',
      })
    }
  }

  // Non-winner notifications
  for (const [userId, entries] of Object.entries(userGroups)) {
    if (entries.length < 5) continue
    const matchCount = entries.filter(e => winningNumbers.includes(e.score)).length
    if (matchCount < 3) {
      const scores = entries.map(e => e.score)
      notificationsToInsert.push({
        user_id: userId,
        title: 'Draw Results Published',
        message: `The ${monthLabel} draw is complete. Winning numbers: [${winningNumbers.join(', ')}]. Your ticket [${scores.join(', ')}] matched ${matchCount} number${matchCount !== 1 ? 's' : ''}. Better luck next month!`,
      })
    }
  }

  // Jackpot rollover
  const jackpotCarryover = tierWinners[5].length === 0 ? tierPools[5] : 0

  // Publish the draw record
  const { error: updErr } = await supabase
    .from('draws')
    .update({ status: 'published', jackpot_carryover: jackpotCarryover })
    .eq('id', drawId)
  if (updErr) return { error: updErr.message }

  // Insert winners
  if (winnersToInsert.length > 0) {
    await supabase.from('draw_winners').insert(winnersToInsert)
  }

  // Send all notifications (DB + email) in one call
  await sendBulkNotifications(supabase, notificationsToInsert, emailByUserId)

  // Reset scores
  if (allUserIds.length > 0) {
    await supabase.from('scores').delete().in('user_id', allUserIds)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true, jackpotCarryover }
}

// ─────────────────────────────────────────────
// Winner approval / rejection
// ─────────────────────────────────────────────
export async function approveWinner(winnerId: string) {
  const supabase = await createClient()

  const { data: winner } = await supabase
    .from('draw_winners')
    .select('*, profiles(id, email), draws(draw_month, draw_year)')
    .eq('id', winnerId)
    .single()

  const { error } = await supabase.from('draw_winners').update({ status: 'paid' }).eq('id', winnerId)
  if (error) return { error: error.message }

  if (winner) {
    const profile = winner.profiles as any
    const draw = winner.draws as any
    const monthLabel = draw
      ? new Date(Number(draw.draw_year), Number(draw.draw_month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
      : 'this month'
    const prize = Number(winner.prize_amount)

    // Single notification → DB + email via unified helper
    await sendNotification(
      supabase,
      profile?.id,
      '✅ Payout Approved!',
      `Your $${prize.toFixed(2)} prize for the ${monthLabel} draw has been approved and will be processed within 3–5 business days.`
    )
  }

  revalidatePath('/admin/winners')
  return { success: true }
}

export async function rejectWinner(winnerId: string) {
  const supabase = await createClient()

  const { data: winner } = await supabase
    .from('draw_winners')
    .select('*, profiles(id, email), draws(draw_month, draw_year)')
    .eq('id', winnerId)
    .single()

  const { error } = await supabase
    .from('draw_winners')
    .update({ status: 'rejected', proof_image_path: null })
    .eq('id', winnerId)
  if (error) return { error: error.message }

  if (winner) {
    const profile = winner.profiles as any
    const draw = winner.draws as any
    const monthLabel = draw
      ? new Date(Number(draw.draw_year), Number(draw.draw_month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
      : 'this month'

    // Also notify on rejection so user knows to contact support
    await sendNotification(
      supabase,
      profile?.id,
      '❌ Payout Rejected',
      `Unfortunately, your winning claim for the ${monthLabel} draw was not verified. If you believe this is an error, please contact support with your score records.`
    )
  }

  revalidatePath('/admin/winners')
  return { success: true }
}
