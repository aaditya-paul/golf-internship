import { createClient } from '@/lib/supabase/server'
import { CheckCircle, AlertCircle, UploadCloud } from 'lucide-react'
import WinnerUploadForm from './WinnerUploadForm'

export default async function WinnersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: winnings } = await supabase
    .from('draw_winners')
    .select('*, draws(execution_date)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Winnings</h1>
        <p className="text-muted-foreground">View your draw payouts and upload verification proofs to unlock your funds.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {!winnings || winnings.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border-dashed border-white/10 text-center">
               <p className="text-muted-foreground">You haven't won any draws yet. Keep logging your scores!</p>
            </div>
         ) : (
            winnings.map(win => (
               <div key={win.id} className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                     <p className="font-bold text-xl text-primary">${win.prize_amount}</p>
                     <p className="text-sm text-foreground">Matched {win.tier} numbers</p>
                     <p className="text-xs text-muted-foreground mt-1">
                        Draw Date: {new Date((win.draws as any).execution_date).toLocaleDateString()}
                     </p>
                  </div>

                  <div className="flex-1 w-full md:w-auto">
                     {win.status === 'paid' && (
                         <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg w-fit md:ml-auto">
                            <CheckCircle className="w-5 h-5" /> Verified & Paid
                         </div>
                     )}
                     
                     {win.status === 'pending' && win.proof_image_path ? (
                         <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg w-fit md:ml-auto">
                            <CheckCircle className="w-5 h-5 text-yellow-400" /> Pending Admin Review
                         </div>
                     ) : win.status !== 'paid' && (
                         <div className="bg-black/40 p-4 rounded-xl border border-white/5 w-full max-w-sm md:ml-auto">
                            <p className="text-xs text-muted-foreground mb-3">Upload a screenshot of your official scorecard to verify this win.</p>
                            <WinnerUploadForm winnerId={win.id} />
                         </div>
                     )}
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  )
}
