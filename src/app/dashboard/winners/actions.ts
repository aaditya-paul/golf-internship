'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('proof') as File
  const winnerId = formData.get('winner_id') as string

  if (!file || !winnerId) {
    return { error: 'Missing required file or ID' }
  }

  // Upload to Supabase Storage 'proofs' bucket
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${winnerId}-${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from('proofs')
    .upload(fileName, file)

  if (uploadError) {
    console.error("Upload error", uploadError)
    return { error: 'File upload failed. Storage bucket might not exist.' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName)

  // Update draw_winners row
  const { error: updateErr } = await supabase
    .from('draw_winners')
    .update({ 
       proof_image_path: publicUrl,
       status: 'pending' // re-review
    })
    .eq('id', winnerId)
    .eq('user_id', user.id)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/dashboard/winners')
  return { success: true }
}
