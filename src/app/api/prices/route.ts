import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function GET() {
  try {
    const [monthlyId, yearlyId] = [
      process.env.STRIPE_MONTHLY_PRICE_ID,
      process.env.STRIPE_YEARLY_PRICE_ID,
    ]

    const results: Record<string, { amount: number; currency: string } | null> = {
      monthly: null,
      yearly: null,
    }

    if (monthlyId) {
      const price = await stripe.prices.retrieve(monthlyId)
      if (price.unit_amount) {
        results.monthly = { amount: price.unit_amount, currency: price.currency }
      }
    }

    if (yearlyId) {
      const price = await stripe.prices.retrieve(yearlyId)
      if (price.unit_amount) {
        results.yearly = { amount: price.unit_amount, currency: price.currency }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Failed to fetch prices:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
