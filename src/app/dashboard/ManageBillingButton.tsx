'use client'

import { useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleManage() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to open billing portal')
      }
      const { url } = await res.json()
      if (url) window.location.href = url
      else throw new Error('No portal URL returned')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleManage}
        disabled={loading}
        className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-lg transition-colors border border-white/10 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
        {loading ? 'Opening Portal...' : 'Manage Billing'}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
