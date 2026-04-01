import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { Users, CreditCard, Gift, Heart, Trophy, BarChart3, DollarSign } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Fetch real Stripe prices
  let monthlyAmount = 0
  try {
    const [mp] = await Promise.all([
      process.env.STRIPE_MONTHLY_PRICE_ID
        ? stripe.prices.retrieve(process.env.STRIPE_MONTHLY_PRICE_ID)
        : null,
    ])
    monthlyAmount = (mp?.unit_amount ?? 0) / 100
  } catch {}

  // Total users + active subs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeSubs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')

  // Total Prize Pool
  const { data: draws } = await supabase.from('draws').select('total_pool, status')
  const totalPoolAllTime = draws?.reduce((acc: number, curr: any) => acc + (curr.total_pool || 0), 0) || 0

  // Winners breakdown
  const { data: allWinners } = await supabase.from('draw_winners').select('tier, prize_amount, status')
  let match5 = 0, match4 = 0, match3 = 0, totalPaidOut = 0
  allWinners?.forEach((w: any) => {
    if (w.tier === 5) match5++
    if (w.tier === 4) match4++
    if (w.tier === 3) match3++
    if (w.status === 'paid') totalPaidOut += Number(w.prize_amount)
  })

  // Per-user donation breakdown
  const { data: activeProfiles } = await supabase
    .from('profiles')
    .select('email, charity_percentage, charities(id, name)')
    .eq('subscription_status', 'active')

  type DonationRow = { email: string; charityName: string; charityPerc: number; monthlyDonation: number }

  const donationRows: DonationRow[] = (activeProfiles || []).map((p: any) => {
    const perc = Number(p.charity_percentage) || 10
    const subscriptionAmt = monthlyAmount || 10
    return {
      email: p.email,
      charityName: p.charities?.name || 'Not selected',
      charityPerc: perc,
      monthlyDonation: parseFloat(((subscriptionAmt * perc) / 100).toFixed(2)),
    }
  })

  const charityDonationTotals: Record<string, { name: string; total: number; users: number }> = {}
  donationRows.forEach(row => {
    const key = row.charityName
    if (!charityDonationTotals[key]) charityDonationTotals[key] = { name: key, total: 0, users: 0 }
    charityDonationTotals[key].total += row.monthlyDonation
    charityDonationTotals[key].users++
  })
  const charityTotals = Object.values(charityDonationTotals).sort((a, b) => b.total - a.total)
  const totalCharityMRR = donationRows.reduce((s, r) => s + r.monthlyDonation, 0)

  return (
    <div className="p-8 space-y-8 animate-in fade-in">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide metrics and financial performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between">
          <Users className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers || 0}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between">
          <CreditCard className="w-6 h-6 text-emerald-400 mb-2" />
          <p className="text-sm text-muted-foreground">Active Subscribers</p>
          <p className="text-3xl font-bold">{activeSubs || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">MRR: ${((activeSubs || 0) * monthlyAmount).toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between">
          <Gift className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-sm text-muted-foreground">Lifetime Prize Pool</p>
          <p className="text-3xl font-bold">${totalPoolAllTime.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col justify-between">
          <Heart className="w-6 h-6 text-pink-500 mb-2" />
          <p className="text-sm text-muted-foreground">Charity Donations / mo</p>
          <p className="text-3xl font-bold">${totalCharityMRR.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {charityTotals.length} charities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border-white/10">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <h2 className="text-xl font-bold">Winners Summary</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span className="font-medium">Total Paid Out</span>
              <span className="text-primary font-bold text-xl">${totalPaidOut.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-sm text-muted-foreground">Match 5</p>
                <p className="text-xl font-bold">{match5}</p>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-sm text-muted-foreground">Match 4</p>
                <p className="text-xl font-bold">{match4}</p>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-sm text-muted-foreground">Match 3</p>
                <p className="text-xl font-bold">{match3}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/10">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4 text-pink-500">
            <Heart className="w-5 h-5" />
            <h2 className="text-xl font-bold">Charity Donations Breakdown</h2>
          </div>
          <div className="space-y-3">
            {charityTotals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active donors yet.</p>
            ) : (
              charityTotals.map(c => (
                <div key={c.name} className="flex justify-between items-center bg-black/30 px-4 py-3 border border-white/5 rounded-xl">
                  <div>
                    <span className="text-sm font-medium">{c.name}</span>
                    <p className="text-xs text-muted-foreground">{c.users} donor{c.users !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-primary font-bold">${c.total.toFixed(2)}/mo</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Per-User Donation Ledger */}
      <div className="glass-panel p-6 rounded-2xl border-white/10">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4 text-emerald-400">
          <DollarSign className="w-5 h-5" />
          <h2 className="text-xl font-bold">Per-User Donation Ledger</h2>
          <span className="text-xs text-muted-foreground ml-auto">
            ${monthlyAmount > 0 ? monthlyAmount : '?'}/mo plan × donation %
          </span>
        </div>
        {donationRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-white/5">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Charity</th>
                  <th className="pb-3 pr-4 text-right">Donation %</th>
                  <th className="pb-3 text-right">Monthly Donation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {donationRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white/80">{row.email}</td>
                    <td className="py-3 pr-4 text-pink-400">{row.charityName}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{row.charityPerc}%</td>
                    <td className="py-3 text-right font-semibold text-primary">${row.monthlyDonation.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="pt-3 text-right text-muted-foreground font-semibold">Total This Month</td>
                  <td className="pt-3 text-right font-bold text-primary text-base">${totalCharityMRR.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
