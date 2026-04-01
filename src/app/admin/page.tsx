import { createClient } from '@/lib/supabase/server'
import { PlayCircle, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { data: activeDraws } = await supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(5)
  const { count: pendingProofs } = await supabase.from('draw_winners').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  
  return (
    <div className="p-8 space-y-8 animate-in fade-in">
       <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Quick stats and links to manage the system.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="glass-panel p-6 rounded-2xl border-white/10 flex items-center gap-4 hover:border-primary/50 transition-colors">
             <Users className="w-8 h-8 text-blue-400" />
             <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usersCount || 0}</p>
             </div>
          </Link>
          
          <Link href="/admin/draws" className="glass-panel p-6 rounded-2xl border-white/10 flex items-center gap-4 hover:border-primary/50 transition-colors">
             <PlayCircle className="w-8 h-8 text-emerald-400" />
             <div>
                <p className="text-sm text-muted-foreground">Active Draws</p>
                <p className="text-2xl font-bold">{activeDraws?.filter(d => d.status === 'pending').length || 0} Pending</p>
             </div>
          </Link>

          <Link href="/admin/winners" className="glass-panel p-6 rounded-2xl border-white/10 flex items-center gap-4 hover:border-primary/50 transition-colors">
             <CheckCircle className="w-8 h-8 text-purple-400" />
             <div>
                <p className="text-sm text-muted-foreground">Proofs to Verify</p>
                <p className="text-2xl font-bold">{pendingProofs || 0}</p>
             </div>
          </Link>
       </div>
    </div>
  )
}
