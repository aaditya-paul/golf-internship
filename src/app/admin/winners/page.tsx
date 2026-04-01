import { createClient } from '@/lib/supabase/server'
import { CheckCircle, XCircle, Clock, Trophy, Calendar, Hash, ExternalLink, FileText } from 'lucide-react'
import { approveWinner, rejectWinner } from '../actions'

export default async function AdminWinnersPage() {
    const supabase = await createClient()

    const { data: allWinners } = await supabase
       .from('draw_winners')
       .select('*, profiles(email), draws(id, winning_numbers, total_pool, execution_date)')
       .order('created_at', { ascending: false })

    const pending = allWinners?.filter(w => w.status === 'pending') || []
    const approved = allWinners?.filter(w => w.status === 'approved' || w.status === 'paid') || []
    const rejected = allWinners?.filter(w => w.status === 'rejected') || []

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
        }
        return map[status] || 'bg-white/10 text-white/60 border-white/10'
    }

    const tierLabel = (tier: number) => {
        if (tier === 5) return '🏆 Jackpot (Match 5)'
        if (tier === 4) return '🥈 Match 4'
        return '🥉 Match 3'
    }

    return (
       <div className="p-8 space-y-10 animate-in fade-in">
          <div>
             <h1 className="text-3xl font-bold mb-2">Winner Management</h1>
             <p className="text-muted-foreground">All winners from published draws. Verify submitted scores against the draw results.</p>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-4">
             <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                   <p className="text-sm text-muted-foreground">Pending</p>
                   <p className="text-xl font-bold">{pending.length}</p>
                </div>
             </div>
             <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                   <p className="text-sm text-muted-foreground">Approved / Paid</p>
                   <p className="text-xl font-bold">{approved.length}</p>
                </div>
             </div>
             <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                   <p className="text-sm text-muted-foreground">Rejected</p>
                   <p className="text-xl font-bold">{rejected.length}</p>
                </div>
             </div>
          </div>

          {!allWinners || allWinners.length === 0 ? (
             <div className="glass-panel p-16 text-center rounded-2xl border-dashed border-white/10">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No winners yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Publish a draw to generate winners automatically.</p>
             </div>
          ) : (
             <div className="space-y-4">
                {allWinners.map(winner => {
                   const draw = winner.draws as any
                   const profile = winner.profiles as any
                   const entries: { score: number; date: string; created_at: string }[] = winner.matched_score_entries || []
                   const winningNums: number[] = draw?.winning_numbers || []

                   return (
                      <div key={winner.id} className="glass-panel p-6 rounded-2xl border-white/10 space-y-5">

                         {/* Header */}
                         <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-4">
                            <div className="flex-1 min-w-0">
                               <h3 className="text-xl font-bold truncate">{profile?.email}</h3>
                               <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                     <Hash className="w-3 h-3" /> Draw <span className="font-mono text-white/60">{winner.draw_id?.slice(0, 8).toUpperCase()}</span>
                                  </span>
                                  {draw?.execution_date && (
                                     <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" /> {new Date(draw.execution_date).toLocaleDateString()}
                                     </span>
                                  )}
                               </div>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wide ${statusBadge(winner.status)}`}>
                               {winner.status}
                            </span>
                         </div>

                         {/* Stats Row */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white/5 rounded-lg px-3 py-2">
                               <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tier</p>
                               <p className="text-sm font-bold mt-0.5">{tierLabel(winner.tier)}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg px-3 py-2">
                               <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Prize</p>
                               <p className="text-sm font-bold text-primary mt-0.5">${Number(winner.prize_amount).toFixed(2)}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg px-3 py-2 md:col-span-2">
                               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Winning Draw Numbers</p>
                               <div className="flex gap-1.5 flex-wrap">
                                  {winningNums.map((n, i) => (
                                     <span key={i} className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">
                                        {n}
                                     </span>
                                  ))}
                               </div>
                            </div>
                         </div>

                         {/* Uploaded Proof */}
                         {(() => {
                            const proof = winner.proof_image_path
                            if (!proof) return (
                               <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-4 text-center">
                                  <p className="text-xs text-muted-foreground">⏳ Awaiting proof upload from user</p>
                               </div>
                            )
                            const isImage = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(proof)
                            const isPdf = /\.pdf$/i.test(proof)
                            return (
                               <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
                                  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                                     <FileText className="w-4 h-4 text-blue-400" />
                                     <p className="text-sm font-semibold">Submitted Proof</p>
                                     <a href={proof} target="_blank" rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
                                        Open <ExternalLink className="w-3 h-3" />
                                     </a>
                                  </div>
                                  {isImage ? (
                                     <img src={proof} alt="Proof" className="w-full max-h-64 object-contain bg-black/40" />
                                  ) : (
                                     <div className="p-4 flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-blue-400" />
                                        <div>
                                           <p className="text-sm font-medium">{isPdf ? 'PDF Document' : 'Document'}</p>
                                           <p className="text-xs text-muted-foreground">Click "Open" to view the file</p>
                                        </div>
                                     </div>
                                  )}
                               </div>
                            )
                         })()}

                         {/* Score Verification Table */}
                         <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                               <Trophy className="w-4 h-4 text-yellow-400" />
                               <p className="text-sm font-semibold">Submitted Scores (Verification Record)</p>
                               <p className="text-xs text-muted-foreground ml-auto">{entries.length} of 5 entries</p>
                            </div>
                            {entries.length === 0 ? (
                               <div className="px-4 py-6 text-center">
                                  <p className="text-xs text-muted-foreground">Score entries were not captured for this draw. Only future publishes will include them.</p>
                               </div>
                            ) : (
                               <table className="w-full text-sm">
                                  <thead>
                                     <tr className="text-left text-muted-foreground text-xs border-b border-white/5">
                                        <th className="px-4 py-2">Score</th>
                                        <th className="px-4 py-2">Round Date</th>
                                        <th className="px-4 py-2">Submitted At</th>
                                        <th className="px-4 py-2 text-center">Matched?</th>
                                     </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                     {entries.map((entry, i) => {
                                        const isMatch = winningNums.includes(entry.score)
                                        return (
                                           <tr key={i} className={isMatch ? 'bg-primary/5' : ''}>
                                              <td className="px-4 py-3">
                                                 <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center font-bold text-sm ${isMatch ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-white/10 text-white/60'}`}>
                                                    {entry.score}
                                                 </span>
                                              </td>
                                              <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                              <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(entry.created_at).toLocaleString()}</td>
                                              <td className="px-4 py-3 text-center">
                                                 {isMatch
                                                    ? <span className="text-primary text-xs font-bold">✓ Match</span>
                                                    : <span className="text-muted-foreground/50 text-xs">—</span>
                                                 }
                                              </td>
                                           </tr>
                                        )
                                     })}
                                  </tbody>
                               </table>
                            )}
                         </div>

                         {/* Actions */}
                         {winner.status === 'pending' && (
                            <div className="flex gap-3">
                               <form action={async () => {
                                  "use server"
                                  await approveWinner(winner.id)
                               }}>
                                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                                     <CheckCircle className="w-4 h-4" /> Approve & Mark Paid
                                  </button>
                               </form>
                               <form action={async () => {
                                  "use server"
                                  await rejectWinner(winner.id)
                               }}>
                                  <button type="submit" className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                                     <XCircle className="w-4 h-4" /> Reject
                                  </button>
                               </form>
                            </div>
                         )}
                      </div>
                   )
                })}
             </div>
          )}
       </div>
    )
}
