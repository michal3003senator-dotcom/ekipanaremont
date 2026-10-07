'use server'

import { randomBytes } from 'node:crypto'

import config from '@payload-config'
import { login, logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { AuthenticationError, getPayload, LockedAuth, UnverifiedEmail } from 'payload'

import { resetPassword as resetPasswordEmail, verifyEmail } from '@/emails/templates'
import { sendEmail, siteUrl } from '@/emails/send'
import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { isStrongPassword } from '@/lib/auth/password'
import { clientIpHash } from '@/lib/auth/request'
import { emailHash } from '@/lib/crypto'
import { currentLegalVersion } from '@/lib/legal'
import { rateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validation/forms'

const WEAK_PASSWORD =
  'To hasło łatwo odgadnąć. Ułóż je z 3–4 niezwiązanych słów, np. „fuga-kielnia-sobota-48”.'
const BOT_CHECK =
  'Nie udało się potwierdzić, że nie jesteś botem. Odśwież stronę i spróbuj ponownie.'
const CHECK_INBOX =
  'Jeśli adres jest poprawny, wysłaliśmy na niego wiadomość. Sprawdź skrzynkę i folder spam.'

/** Tylko ścieżki w panelu – bez przekierowań na zewnątrz (open redirect). */
const safeNext = (next?: string) => (next && /^\/panel(\/[\w\-/]*)?$/.test(next) ? next : '/panel')

/** Nowy token weryfikacyjny i e-mail z linkiem ważnym 24 h (ADR 0018). */
async function sendVerification(accountId: string, email: string) {
  const payload = await getPayload({ config })
  const token = randomBytes(20).toString('hex')
  await payload.update({
    collection: 'firmAccounts',
    id: accountId,
    data: { _verificationToken: token, verificationSentAt: new Date().toISOString() },
    overrideAccess: true,
    context: { skipAudit: true },
  })
  await sendEmail(payload, email, verifyEmail(siteUrl(`/potwierdz/${token}`)))
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { email, password, turnstileToken } = parsed.data

  const limit = await rateLimit('register', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(turnstileToken))) return { ok: false, message: BOT_CHECK }
  if (!isStrongPassword(password, [email.split('@')[0] ?? ''])) {
    return { ok: false, fieldErrors: { password: WEAK_PASSWORD } }
  }

  const payload = await getPayload({ config })
  const existing = await payload.count({
    collection: 'firmAccounts',
    where: { email: { equals: email } },
    overrideAccess: true,
  })
  // Ta sama odpowiedź dla zajętego adresu – formularz nie zdradza, kto ma konto.
  if (existing.totalDocs > 0) return { ok: true, message: CHECK_INBOX }

  const account = await payload.create({
    collection: 'firmAccounts',
    data: {
      email,
      password,
      termsVersion: await currentLegalVersion(payload, 'terms'),
      termsAcceptedAt: new Date().toISOString(),
    },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  await sendVerification(account.id, email)
  return { ok: true, message: CHECK_INBOX }
}

export async function resendVerificationAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const limit = await rateLimit('verifyResend', emailHash(parsed.data.email))
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firmAccounts',
    where: { email: { equals: parsed.data.email }, _verified: { not_equals: true } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0]) await sendVerification(docs[0].id, docs[0].email)
  return { ok: true, message: CHECK_INBOX }
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { email, password, next } = parsed.data

  const [byIp, byEmail] = await Promise.all([
    rateLimit('login', await clientIpHash()),
    rateLimit('loginEmail', emailHash(email)),
  ])
  if (!byIp.ok || !byEmail.ok)
    return tooManyRequests(Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds))

  try {
    await login({ collection: 'firmAccounts', config, email, password })
  } catch (error) {
    if (error instanceof UnverifiedEmail) {
      return {
        ok: false,
        message: 'Najpierw potwierdź adres e-mail. Link wysłaliśmy po rejestracji.',
        fieldErrors: { form: 'unverified' },
      }
    }
    if (error instanceof LockedAuth) {
      return {
        ok: false,
        message:
          'Po kilku błędnych próbach konto jest zablokowane na 15 minut. Możesz też ustawić nowe hasło.',
      }
    }
    if (error instanceof AuthenticationError)
      return { ok: false, message: 'Nieprawidłowy e-mail lub hasło.' }
    throw error
  }
  redirect(safeNext(next))
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const limit = await rateLimit('passwordReset', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(parsed.data.turnstileToken))) return { ok: false, message: BOT_CHECK }

  const payload = await getPayload({ config })
  const token = await payload.forgotPassword({
    collection: 'firmAccounts',
    data: { email: parsed.data.email },
    disableEmail: true,
  })
  if (token)
    await sendEmail(
      payload,
      parsed.data.email,
      resetPasswordEmail(siteUrl(`/reset-hasla/${token}`)),
    )
  return { ok: true, message: CHECK_INBOX }
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  if (!isStrongPassword(parsed.data.password))
    return { ok: false, fieldErrors: { password: WEAK_PASSWORD } }
  const limit = await rateLimit('passwordReset', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)

  const payload = await getPayload({ config })
  try {
    await payload.resetPassword({
      collection: 'firmAccounts',
      data: { token: parsed.data.token, password: parsed.data.password },
      overrideAccess: true,
    })
  } catch {
    return { ok: false, message: 'Link wygasł albo został już użyty. Poproś o nowy.' }
  }
  redirect('/logowanie?haslo=zmienione')
}

export async function logoutAction(): Promise<void> {
  await logout({ config })
  redirect('/')
}
