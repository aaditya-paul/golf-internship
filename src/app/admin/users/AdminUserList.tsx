'use client'

import { useState } from 'react'
import { updateUserSubscription, deleteUserScore } from './actions'
import { Trash2, ChevronDown, ChevronRight, Activity } from 'lucide-react'

export default function AdminUserList({ initialProfiles }: { initialProfiles: any[] }) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  async function handleStatusChange(userId: string, newStatus: string) {
     setLoadingMap(prev => ({ ...prev, [userId]: true }))
     alert('Updating subscription status...')
     const res = await updateUserSubscription(userId, newStatus)
     if (res.error) alert(res.error)
     setLoadingMap(prev => ({ ...prev, [userId]: false }))
  }

  async function handleDeleteScore(scoreId: string, userId: string) {
     if (!confirm('Are you sure you want to delete this score? This may affect their lottery ticket.')) return
     setLoadingMap(prev => ({ ...prev, [scoreId]: true }))
     const res = await deleteUserScore(scoreId)
     if (res.error) alert(res.error)
     setLoadingMap(prev => ({ ...prev, [scoreId]: false }))
  }

  return (
    <div className="space-y-4">
       {initialProfiles.map(profile => {
          const isExpanded = expandedUser === profile.id
          
          return (
             <div key={profile.id} className="glass border border-white/5 rounded-xl overflow-hidden">
                {/* Header Row */}
                <div 
                   className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                   onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
                >
                   <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                      <div>
                         <p className="font-semibold">{profile.email}</p>
                         <p className="text-xs text-muted-foreground">Charity: {profile.charity?.name || 'None'} ({profile.charity_percentage}%)</p>
                      </div>
                   </div>
                   
                     <div className="flex items-center gap-6 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                       <div className="flex items-center gap-2">
                          <Activity className={`w-4 h-4 ${profile.subscription_status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <select 
                             value={profile.subscription_status}
                             onChange={(e) => handleStatusChange(profile.id, e.target.value)}
                             disabled={loadingMap[profile.id]}
                             className="bg-transparent text-sm border-b border-white/20 focus:outline-none focus:border-primary pb-1"
                          >
                             <option value="active" className="bg-black text-white">Active</option>
                             <option value="inactive" className="bg-black text-white">Inactive</option>
                             <option value="past_due" className="bg-black text-white">Past Due</option>
                             <option value="canceled" className="bg-black text-white">Canceled</option>
                          </select>
                       </div>
                   </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                   <div className="p-4 bg-black/40 border-t border-white/5">
                      <h4 className="text-sm font-semibold mb-3">Recent Scores ({profile.scores?.length || 0})</h4>
                      <div className="space-y-2">
                         {profile.scores?.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No scores tracked.</p>
                         ) : (
                            profile.scores?.map((score: any) => (
                               <div key={score.id} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg gap-3">
                                  <div className="flex gap-4 min-w-0">
                                     <span className="font-bold text-primary w-8 text-center">{score.score}</span>
                                     <span className="text-muted-foreground text-sm truncate">{new Date(score.date).toLocaleDateString()}</span>
                                  </div>
                                  <button 
                                     onClick={() => handleDeleteScore(score.id, profile.id)}
                                     disabled={loadingMap[score.id]}
                                     className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors p-1"
                                     title="Delete Score"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            ))
                         )}
                      </div>
                   </div>
                )}
             </div>
          )
       })}
    </div>
  )
}
