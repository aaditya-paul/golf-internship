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
       <aside className="w-full md:w-64 glass border-b md:border-b-0 md:border-r border-white/5 p-4 sm:p-6 flex flex-col gap-4 md:gap-8 md:min-h-screen">
          <div className="flex items-center gap-2 text-primary">
             <ShieldCheck className="w-8 h-8" />
             <span className="font-bold text-xl tracking-tighter">Admin Portal</span>
          </div>

          <nav className="flex-1 flex md:block gap-2 md:space-y-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <Link href="/admin" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Home className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/admin/users" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Users className="w-5 h-5" /> Users & Subs
            </Link>
            <Link href="/admin/draws" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <PlayCircle className="w-5 h-5" /> Draws
            </Link>
            <Link href="/admin/winners" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Trophy className="w-5 h-5" /> Winners
            </Link>
            <Link href="/admin/charities" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <Heart className="w-5 h-5" /> Charities
            </Link>
            <Link href="/admin/analytics" className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
               <LineChart className="w-5 h-5" /> Analytics
            </Link>
          </nav>

          <div className="pt-4 md:pt-8 border-t border-white/5">
             <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white">
                &larr; Back to App
             </Link>
          </div>
       </aside>
       
       {/* Main Content Area */}
       <main className="flex-1 overflow-x-hidden md:max-h-screen md:overflow-y-auto">
          {children}
       </main>
    </div>
  )
}
