'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserSubscription(userId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ subscription_status: status }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUserScore(scoreId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('scores').delete().eq('id', scoreId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
