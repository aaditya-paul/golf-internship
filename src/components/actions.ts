'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markNotificationsAsRead(notificationIds: string[]) {
    if (notificationIds.length === 0) return { success: true }
    
    const supabase = await createClient()
    const { error } = await supabase
       .from('notifications')
       .update({ read: true })
       .in('id', notificationIds)
       
    if (error) return { error: error.message }
    
    revalidatePath('/dashboard')
    return { success: true }
}
