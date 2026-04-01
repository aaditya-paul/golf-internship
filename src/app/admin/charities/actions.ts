'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCharity(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  
  const { error } = await supabase.from('charities').insert({ name, description, website })
  if (error) return { error: error.message }
  revalidatePath('/admin/charities')
  return { success: true }
}

export async function editCharity(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  
  const { error } = await supabase.from('charities').update({ name, description, website }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charities')
  return { success: true }
}

export async function deleteCharity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('charities').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charities')
  return { success: true }
}
