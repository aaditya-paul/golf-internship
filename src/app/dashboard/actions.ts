'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const scoreStr = formData.get('score') as string
  const score = parseInt(scoreStr, 10)

  if (isNaN(score) || score < 1 || score > 45) {
    return { error: 'Invalid score. Must be between 1 and 45.' }
  }

  // Ensure they haven't submitted this exact score already to enforce 5 distinct numbers
  const { data: existingScores } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('score', score)

  if (existingScores && existingScores.length > 0) {
    return { error: `You have already submitted a score of ${score}. Scores must be distinct.` }
  }

  const { error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score: score
    })

  if (error) {
    console.error("Error inserting score:", error)
    return { error: 'Failed to add score.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteScore(scoreId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete score' }

  revalidatePath('/dashboard')
  return { success: true }
}
