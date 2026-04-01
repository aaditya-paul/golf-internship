'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { addScore } from './actions'

export default function ScoreForm({ currentScoresCount }: { currentScoresCount: number }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLocked = currentScoresCount >= 5

  async function handleSubmit(formData: FormData) {
    if (isLocked) return
    setLoading(true)
    setError(null)
    const result = await addScore(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2 mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
          <Info className="w-4 h-4" /> How to Play
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Enter your <strong>18-hole Stableford scores</strong> after each round you play.</li>
          <li>Scores must be between <strong>1 and 45 points</strong>.</li>
          <li>Your latest 5 distinct scores automatically generate your <strong>monthly jackpot ticket</strong>.</li>
          <li className="text-red-300">Once you enter 5 scores, they are <strong>locked for the month</strong> and cannot be changed.</li>
        </ul>
      </div>
      
      {isLocked && (
         <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm font-semibold flex items-center justify-center">
            🔒 You have filled all 5 tickets for this draw. Changes are locked.
         </div>
      )}

      <form action={handleSubmit} className="flex gap-2">
        <input 
          type="number" 
          name="score"
          min="1" 
          max="45" 
          placeholder="Score (1-45)" 
          required
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 text-white"
          disabled={loading || isLocked}
        />
        <button 
          type="submit" 
          disabled={loading || isLocked}
          className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg neon-button disabled:opacity-50 disabled:grayscale transition-all"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
