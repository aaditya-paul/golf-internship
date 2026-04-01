'use client'

import { useState } from 'react'
import { UploadCloud, FileCheck, AlertCircle } from 'lucide-react'
import { uploadProof } from './actions'

const ACCEPT = 'image/*,application/pdf,.doc,.docx'

export default function WinnerUploadForm({ winnerId }: { winnerId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('winner_id', winnerId)
    setLoading(true)
    setError(null)
    const res = await uploadProof(formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
        <FileCheck className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold">Proof submitted!</p>
          <p className="text-xs text-emerald-400/70">The admin team will review it shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 hover:border-primary/40 transition-colors rounded-xl p-6 cursor-pointer bg-white/5 hover:bg-primary/5 group">
        <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        <div className="text-center">
          <p className="text-sm font-semibold">{fileName || 'Upload Scorecard Proof'}</p>
          <p className="text-xs text-muted-foreground mt-1">Image, PDF, or Word document — max 10MB</p>
        </div>
        <input
          type="file"
          name="proof"
          accept={ACCEPT}
          required
          className="sr-only"
          onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={loading || !fileName}
        className="w-full bg-primary text-black font-bold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all neon-button"
      >
        <UploadCloud className="w-4 h-4" />
        {loading ? 'Uploading...' : 'Submit Proof'}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </form>
  )
}
