'use client'

import { useState } from 'react'
import { addCharity, editCharity, deleteCharity } from './actions'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function AdminCharityList({ initialCharities }: { initialCharities: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAdd(formData: FormData) {
      setLoading(true)
      const res = await addCharity(formData)
      if (res.error) alert(res.error)
      else setIsAdding(false)
      setLoading(false)
  }

  async function handleEdit(id: string, formData: FormData) {
      setLoading(true)
      const res = await editCharity(id, formData)
      if (res.error) alert(res.error)
      else setEditingId(null)
      setLoading(false)
  }

  async function handleDelete(id: string) {
      if (!confirm('Are you sure you want to delete this charity? Active users tracking it might be affected.')) return
      setLoading(true)
      const res = await deleteCharity(id)
      if (res.error) alert(res.error)
      setLoading(false)
  }

  return (
    <div className="space-y-6">
       {!isAdding && (
           <button 
              onClick={() => setIsAdding(true)}
              className="bg-primary text-black font-semibold px-4 py-2 rounded-lg neon-button flex items-center gap-2"
           >
               <Plus className="w-5 h-5" /> Add Charity
           </button>
       )}

       {isAdding && (
           <div className="glass p-4 sm:p-6 rounded-2xl border border-white/20 relative">
               <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
                   <X className="w-5 h-5" />
               </button>
               <h3 className="font-bold text-lg mb-4">Add New Charity</h3>
               <form action={handleAdd} className="space-y-4">
                  <input name="name" required placeholder="Charity Name" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                  <textarea name="description" required placeholder="Description" rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                  <input name="website" type="url" placeholder="Website URL" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                  <button type="submit" disabled={loading} className="bg-primary text-black font-semibold px-6 py-2 rounded-lg neon-button">
                      Save Charity
                  </button>
               </form>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {initialCharities.map(charity => (
               <div key={charity.id} className="glass p-6 rounded-2xl flex flex-col justify-between">
                   {editingId === charity.id ? (
                      <form action={(fd) => handleEdit(charity.id, fd)} className="space-y-4">
                          <input name="name" defaultValue={charity.name} required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                          <textarea name="description" defaultValue={charity.description} required rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                          <input name="website" type="url" defaultValue={charity.website} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                          
                                  <div className="flex flex-col sm:flex-row gap-2">
                             <button type="submit" disabled={loading} className="bg-primary text-black text-sm font-semibold px-4 py-2 rounded-lg">Update</button>
                             <button type="button" onClick={() => setEditingId(null)} className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg">Cancel</button>
                          </div>
                      </form>
                   ) : (
                      <>
                         <div>
                            <h3 className="font-bold text-lg">{charity.name}</h3>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{charity.description}</p>
                            {charity.website && (
                                <a href={charity.website} target="_blank" className="text-xs text-primary mt-2 inline-block hover:underline">Visit Website &rarr;</a>
                            )}
                         </div>
                         <div className="flex gap-2 mt-6">
                            <button onClick={() => setEditingId(charity.id)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(charity.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </>
                   )}
               </div>
           ))}
       </div>
    </div>
  )
}
