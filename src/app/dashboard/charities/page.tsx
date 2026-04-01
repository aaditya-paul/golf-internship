import { createClient } from '@/lib/supabase/server'
import { Heart, Search, CheckCircle } from 'lucide-react'
import CharityClientForm from './CharityClientForm'

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let uiQuery = supabase.from('charities').select('*').order('name', { ascending: true })
  if (q) {
      uiQuery = uiQuery.ilike('name', `%${q}%`)
  }
  
  const { data: charities } = await uiQuery
  const { data: profile } = await supabase.from('profiles').select('charity_id, charity_percentage').eq('id', user?.id).single()

  const currentSettings = {
     charityId: profile?.charity_id || null,
     percentage: profile?.charity_percentage || 10
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charity Directory</h1>
        <p className="text-muted-foreground mt-1">Select the organization you wish to support. A minimum of 10% of your subscription goes to them.</p>
      </div>

      <CharityClientForm currentSettings={currentSettings} charities={charities || []} />
    </div>
  )
}
