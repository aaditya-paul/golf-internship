import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use onboarding@resend.dev for free / unverified accounts.
// Once you verify "swing-and-win.com" in your Resend dashboard,
// change this to: 'Swing&Win <notifications@swing-and-win.com>'
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Swing&Win <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email send.')
    return
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html })
    console.log('[Email] Sent to', to, '— id:', result.data?.id ?? 'unknown')
  } catch (err) {
    console.error('[Email] Failed to send email to', to, ':', err)
  }
}

// ─── Templates ──────────────────────────────

export function drawResultEmail(params: {
  winningNumbers: number[]
  monthLabel: string
  didWin: boolean
  tier?: number
  prize?: number
  ticketNumbers?: number[]
}) {
  const { winningNumbers, monthLabel, didWin, tier, prize, ticketNumbers } = params

  if (didWin) {
    return {
      subject: `🎉 You Won the ${monthLabel} Draw! – Swing&Win`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0f0e;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0a2e1a,#14c846);padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px">🏆 You Won!</h1>
            <p style="opacity:.8;margin:8px 0 0">Match ${tier} — ${monthLabel} Draw</p>
          </div>
          <div style="padding:32px">
            <p>Congratulations! Your ticket matched <strong>${tier} numbers</strong> in the ${monthLabel} draw.</p>
            <div style="background:#0f1a12;border:1px solid #14c84630;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
              <p style="margin:0 0 8px;font-size:13px;opacity:.6">Prize Amount</p>
              <p style="margin:0;font-size:36px;font-weight:bold;color:#14c846">$${prize?.toFixed(2)}</p>
            </div>
            <p style="font-size:13px;opacity:.7">Winning numbers: <strong>${winningNumbers.join(' · ')}</strong></p>
            <p style="font-size:13px;opacity:.7">Your ticket: <strong>${ticketNumbers?.join(' · ')}</strong></p>
            <p>Our admin team will verify your score history and process your payout shortly. You'll receive another email once it's approved.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                 style="background:#14c846;color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    }
  }

  return {
    subject: `${monthLabel} Draw Results – Swing&Win`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0f0e;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:#111;padding:32px;text-align:center;border-bottom:1px solid #222">
          <h1 style="margin:0;font-size:24px">Draw Results</h1>
          <p style="opacity:.6;margin:8px 0 0">${monthLabel}</p>
        </div>
        <div style="padding:32px">
          <p>The ${monthLabel} draw has been completed. Unfortunately your ticket didn't match enough numbers this time.</p>
          <div style="background:#0f1117;border-radius:8px;padding:16px;margin:20px 0">
            <p style="font-size:13px;margin:0 0 8px;opacity:.6">Winning Numbers</p>
            <p style="margin:0;font-weight:bold;font-size:18px;color:#14c846">${winningNumbers.join(' · ')}</p>
          </div>
          ${ticketNumbers ? `<p style="font-size:13px;opacity:.7">Your ticket: ${ticketNumbers.join(' · ')}</p>` : ''}
          <p>Keep submitting your scores — next month's draw could be yours!</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
               style="background:#14c846;color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
              Submit Scores for Next Month
            </a>
          </div>
        </div>
      </div>
    `,
  }
}

export function payoutApprovedEmail(params: { prize: number; monthLabel: string }) {
  return {
    subject: `✅ Your Payout Has Been Approved – Swing&Win`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0f0e;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0d2a1a,#059669);padding:40px;text-align:center">
          <h1 style="margin:0;font-size:28px">✅ Payout Approved</h1>
        </div>
        <div style="padding:32px">
          <p>Great news! Your winning payout for the <strong>${params.monthLabel}</strong> draw has been verified and approved.</p>
          <div style="background:#0f1117;border:1px solid #05966930;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
            <p style="margin:0 0 8px;font-size:13px;opacity:.6">Approved Amount</p>
            <p style="margin:0;font-size:36px;font-weight:bold;color:#10b981">$${params.prize.toFixed(2)}</p>
          </div>
          <p style="font-size:14px;opacity:.7">Payment will be processed to your registered account within 3–5 business days.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
               style="background:#10b981;color:#000;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }
}
