import type { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from './email'

type NotificationPayload = {
  user_id: string
  title: string
  message: string
  ctaUrl?: string
  ctaLabel?: string
}

// Generic notification email template
function notificationEmail(params: { title: string; message: string; ctaUrl?: string; ctaLabel?: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const ctaUrl = params.ctaUrl ?? `${siteUrl}/dashboard`
  const ctaLabel = params.ctaLabel ?? 'Open Dashboard'

  return {
    subject: `${params.title} – Swing&Win`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0f0e;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0a2e1a,#14284a);padding:32px;text-align:center;border-bottom:1px solid #1a2a1a">
          <h1 style="margin:0;font-size:22px;font-weight:700">${params.title}</h1>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#d1d5db">${params.message}</p>
          <div style="text-align:center">
            <a href="${ctaUrl}"
               style="background:#14c846;color:#000;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-size:14px">
              ${ctaLabel}
            </a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1a2a1a;text-align:center">
          <p style="margin:0;font-size:11px;color:#6b7280">
            You're receiving this because you have an active Swing&amp;Win account.
          </p>
        </div>
      </div>
    `,
  }
}

// ─────────────────────────────────────────────────────────────
// sendNotification — single: inserts DB row + sends email
// ─────────────────────────────────────────────────────────────
export async function sendNotification(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  message: string,
  opts?: { ctaUrl?: string; ctaLabel?: string }
) {
  await supabase.from('notifications').insert({ user_id: userId, title, message })

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (profile?.email) {
    const tpl = notificationEmail({ title, message, ctaUrl: opts?.ctaUrl, ctaLabel: opts?.ctaLabel })
    await sendEmail({ to: profile.email, ...tpl })
  }
}

// ─────────────────────────────────────────────────────────────
// sendBulkNotifications — batch insert + emails
// ─────────────────────────────────────────────────────────────
export async function sendBulkNotifications(
  supabase: SupabaseClient,
  notifications: NotificationPayload[],
  emailByUserId: Record<string, string>
) {
  if (notifications.length === 0) return

  // Insert only the DB columns (strip ctaUrl/ctaLabel which are email-only)
  await supabase.from('notifications').insert(
    notifications.map(({ ctaUrl: _u, ctaLabel: _l, ...rest }) => rest)
  )

  // Fire all emails concurrently
  await Promise.allSettled(
    notifications.map(n => {
      const email = emailByUserId[n.user_id]
      if (!email) return Promise.resolve()
      const tpl = notificationEmail({ title: n.title, message: n.message, ctaUrl: n.ctaUrl, ctaLabel: n.ctaLabel })
      return sendEmail({ to: email, ...tpl })
    })
  )
}
