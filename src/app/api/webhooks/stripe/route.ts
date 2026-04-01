import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// We need a service role client to bypass RLS in the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) return new NextResponse('Webhook secret not found', { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription
  const invoice = event.data.object as Stripe.Invoice

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        if (session.client_reference_id) {
          // Update profile with customer ID and initial subscription status
          await supabaseAdmin.from('profiles').update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active'
          }).eq('id', session.client_reference_id)
        }
        break
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const customerId = subscription.customer as string
        const status = subscription.status

        await supabaseAdmin.from('profiles').update({
          subscription_status: status === 'active' || status === 'trialing' ? 'active' : status
        }).eq('stripe_customer_id', customerId)
        break

      case 'invoice.payment_succeeded':
        // Handle precise prize pool addition (as per user instruction)
        // e.g., if subscription is $10/mo, we put $5 into the pool (50%)
        // Or if percentage is defined, say 40% of the invoice total.
        const totalAmountPaid = invoice.amount_paid // in cents
        if (totalAmountPaid > 0) {
           // Define contribution rate (e.g. 50% to prize pool)
           const POOL_PERCENTAGE = 0.50
           const addition = (totalAmountPaid * POOL_PERCENTAGE) / 100 // Convert cents to dollars

           // Find the 'pending' active draw for this month and add to total_pool
           // For simplicity, find the most recent pending draw
           const { data: activeDraw } = await supabaseAdmin
             .from('draws')
             .select('id, total_pool')
             .eq('status', 'pending')
             .order('execution_date', { ascending: false })
             .limit(1)
             .single()

           if (activeDraw) {
              const newTotal = Number(activeDraw.total_pool) + addition
              // Distribute the new pool according to rules: 40% jackpot, 35% match_4, 25% match_3
              await supabaseAdmin.from('draws').update({
                 total_pool: newTotal,
                 jackpot_pool: newTotal * 0.40,
                 match_4_pool: newTotal * 0.35,
                 match_3_pool: newTotal * 0.25
              }).eq('id', activeDraw.id)
           }
        }
        break
        
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event', error)
    return new NextResponse('Internal Error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
