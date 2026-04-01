'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateCharitySelection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const charityIdStr = formData.get('charity_id') as string | null
  const percentageStr = formData.get('charity_percentage') as string | null

  // If selecting a charity
  if (charityIdStr && !percentageStr) {
     const { error } = await supabase
       .from('profiles')
       .update({ charity_id: charityIdStr })
       .eq('id', user.id)

     if (error) return { error: 'Failed to update charity selection' }
  }

  // If updating percentage
  if (percentageStr) {
     const percentage = parseInt(percentageStr, 10)
     if (isNaN(percentage) || percentage < 10 || percentage > 100) {
        return { error: 'Percentage must be between 10 and 100.' }
     }
     
     const { error } = await supabase
       .from('profiles')
       .update({ charity_percentage: percentage })
       .eq('id', user.id)

     if (error) return { error: 'Failed to update charity percentage' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charities')
  return { success: true }
}
