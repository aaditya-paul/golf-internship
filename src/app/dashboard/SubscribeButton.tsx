'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Check, Zap, Calendar } from 'lucide-react'

type PlanInfo = {
  monthly: { amount: number; currency: string } | null
  yearly: { amount: number; currency: string } | null
}

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [prices, setPrices] = useState<PlanInfo>({ monthly: null, yearly: null })
  const [fetchingPrices, setFetchingPrices] = useState(true)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices')
        if (res.ok) {
          const data = await res.json()
          setPrices(data)
        }
      } catch {}
      setFetchingPrices(false)
    }
    fetchPrices()
  }, [])

  function formatPrice(info: { amount: number; currency: string } | null) {
    if (!info) return '...'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: info.currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(info.amount / 100)
  }

  const monthlyPrice = prices.monthly ? prices.monthly.amount / 100 : null
  const yearlyPrice = prices.yearly ? prices.yearly.amount / 100 : null
  const yearlySavingsPct = monthlyPrice && yearlyPrice
    ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)
    : null

  async function handleSubscribe() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const { url } = await res.json()
      if (url) window.location.href = url
      else throw new Error('No checkout URL returned')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      key: 'monthly' as const,
      label: 'Monthly',
      icon: <Zap className="w-4 h-4" />,
      price: formatPrice(prices.monthly),
      sub: 'per month',
      badge: null,
    },
    {
      key: 'yearly' as const,
      label: 'Annual',
      icon: <Calendar className="w-4 h-4" />,
      price: formatPrice(prices.yearly),
      sub: 'per year',
      badge: yearlySavingsPct ? `Save ${yearlySavingsPct}%` : null,
    },
  ]

  return (
    <div className="space-y-3">
      {/* Plan Cards */}
      <div className="grid grid-cols-2 gap-3">
        {plans.map(plan => (
          <button
            key={plan.key}
            onClick={() => setSelectedPlan(plan.key)}
            className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
              selectedPlan === plan.key
                ? 'border-primary bg-primary/10 shadow-[0_0_12px_rgba(20,200,70,0.15)]'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            {plan.badge && (
              <span className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {plan.badge}
              </span>
            )}
            <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${selectedPlan === plan.key ? 'text-primary' : 'text-muted-foreground'}`}>
              {plan.icon} {plan.label}
            </div>
            {fetchingPrices ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <span className="text-lg font-bold text-white">{plan.price}</span>
                <span className="text-[10px] text-muted-foreground">{plan.sub}</span>
              </>
            )}
            {selectedPlan === plan.key && (
              <Check className="absolute bottom-2 right-2 w-3 h-3 text-primary" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading || fetchingPrices}
        className="w-full bg-primary text-black font-bold py-2.5 rounded-xl neon-button disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Redirecting to Stripe...' : `Subscribe — ${selectedPlan === 'monthly' ? formatPrice(prices.monthly) + '/mo' : formatPrice(prices.yearly) + '/yr'}`}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
