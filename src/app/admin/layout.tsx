import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, PlayCircle, Trophy, Heart, LineChart, Home } from 'lucide-react'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
       {/* Sidebar */}
       <aside className="w-full md:w-64 glass border-r border-white/5 p-6 flex flex-col gap-8 md:min-h-screen">
          <div className="flex items-center gap-2 text-primary">
             <ShieldCheck className="w-8 h-8" />
             <span className="font-bold text-xl tracking-tighter">Admin Portal</span>
          </div>

          <nav className="flex-1 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Home className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Users className="w-5 h-5" /> Users & Subs
            </Link>
            <Link href="/admin/draws" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <PlayCircle className="w-5 h-5" /> Draws
            </Link>
            <Link href="/admin/winners" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Trophy className="w-5 h-5" /> Winners
            </Link>
            <Link href="/admin/charities" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Heart className="w-5 h-5" /> Charities
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <LineChart className="w-5 h-5" /> Analytics
            </Link>
          </nav>

          <div className="pt-8 border-t border-white/5">
             <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white">
                &larr; Back to App
             </Link>
          </div>
       </aside>
       
       {/* Main Content Area */}
       <main className="flex-1 max-h-screen overflow-y-auto">
          {children}
       </main>
    </div>
  )
}
