import Link from 'next/link'
import { ArrowLeft, CheckCircle2, HeartHandshake, Trophy, Upload } from 'lucide-react'

const steps = [
  {
    title: 'Join the club',
    body: 'Create your account and activate your subscription to start participating in monthly draws.',
    icon: CheckCircle2,
  },
  {
    title: 'Submit 5 distinct scores',
    body: 'Each month you submit five Stableford scores between 1 and 45. Those become your monthly ticket numbers.',
    icon: Upload,
  },
  {
    title: 'Monthly draw is published',
    body: 'Admin publishes five winning numbers. Matching 3, 4, or 5 numbers qualifies you for a prize tier.',
    icon: Trophy,
  },
  {
    title: 'Winners verify and get paid',
    body: 'If you win, submit proof from your scorecard. Once approved, payout is processed to your account.',
    icon: HeartHandshake,
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">How Swing&Win Works</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>

        <p className="max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          Swing&Win combines monthly competition and charitable giving. You play your normal golf rounds,
          submit scores, and your entries go into the monthly draw while a portion of subscription revenue supports charity.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {steps.map(step => {
            const Icon = step.icon
            return (
              <article key={step.title} className="glass-panel border border-white/10 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/15 p-2 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{step.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="glass-panel border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <h3 className="text-xl font-semibold">Prize Tiers</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <li className="rounded-xl bg-white/5 border border-white/10 p-4">Match 5: Jackpot tier</li>
            <li className="rounded-xl bg-white/5 border border-white/10 p-4">Match 4: Mid-tier payout</li>
            <li className="rounded-xl bg-white/5 border border-white/10 p-4">Match 3: Entry-tier payout</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Final prize values depend on active subscriptions and the current month pool.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black hover:brightness-110"
          >
            Join Now
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10"
          >
            I Already Have an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
