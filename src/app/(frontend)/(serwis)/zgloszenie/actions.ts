'use server'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { sendEmail } from '@/emails/send'
import { reportReceived } from '@/emails/templates'
import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { clientIpHash } from '@/lib/auth/request'
import { getFirmSession } from '@/lib/auth/session'
import { appealSubject } from '@/lib/moderation/decisions'
import type { PublicTarget } from '@/lib/moderation/options'
import { rateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'
import { appealSchema, reportSchema } from '@/lib/validation/moderation'

const BOT_CHECK =
  'Nie udało się potwierdzić, że nie jesteś botem. Odśwież stronę i spróbuj ponownie.'
const GONE = 'Tej treści już nie ma albo nie jest publiczna.'

/** Tytuł zgłaszanej treści – tylko publicznie widocznej (reguły dostępu gościa). */
async function publicTitle(payload: Payload, type: PublicTarget, id: string) {
  const guest = { overrideAccess: false, depth: 1, disableErrors: true } as const
  if (type === 'firms') {
    const firm = await payload.findByID({ collection: 'firms', id, ...guest })
    return firm ? `profil firmy ${firm.name}` : null
  }
  if (type === 'reviews') {
    const review = await payload.findByID({ collection: 'reviews', id, ...guest })
    const firm = review && typeof review.firm === 'object' ? review.firm : null
    return review ? `opinia (${review.rating}/5) o firmie ${firm?.name ?? ''}`.trim() : null
  }
  const article = await payload.findByID({ collection: 'articles', id, ...guest })
  return article ? `artykuł „${article.title}”` : null
}

/** Potwierdzenie przyjęcia – błąd poczty nie cofa zgłoszenia. */
async function confirm(payload: Payload, to: string, what: string) {
  try {
    await sendEmail(payload, to, reportReceived(what))
  } catch {
    payload.logger.warn({ msg: 'Nie wysłano potwierdzenia zgłoszenia' })
  }
}

/**
 * Zgłoszenie treści (SPEC 3.13, art. 16 DSA): Zod, limit 5/h na skrót IP, Turnstile, dane
 * zgłaszającego szyfrowane w hookach pól, potwierdzenie e-mailem.
 */
export async function reportAction(input: unknown): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const data = parsed.data
  const limit = await rateLimit('report', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, message: BOT_CHECK }

  const payload = await getPayload({ config })
  const title = await publicTitle(payload, data.targetType, data.targetId)
  if (!title) return { ok: false, message: GONE }
  const account = await getFirmSession()
  await payload.create({
    collection: 'reports',
    data: {
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: title.slice(0, 200),
      reason: data.reason,
      description: data.description,
      reporterName: data.reporterName || undefined,
      reporterEmail: data.reporterEmail,
      reporterAccount: account?.id,
      goodFaithConfirmed: true,
      status: 'new',
    },
    overrideAccess: true,
  })
  await confirm(payload, data.reporterEmail, title)
  return { ok: true }
}

/** Odwołanie od decyzji (art. 20 DSA): link z e-maila, jedno odwołanie na decyzję. */
export async function appealAction(input: unknown): Promise<ActionResult> {
  const parsed = appealSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const data = parsed.data
  const reportId = appealSubject(data.token)
  if (!reportId) return { ok: false, message: 'Link do odwołania wygasł albo jest niepełny.' }
  const limit = await rateLimit('appeal', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, message: BOT_CHECK }

  const payload = await getPayload({ config })
  const system = { overrideAccess: true, depth: 0 } as const
  const decision = await payload.findByID({
    collection: 'reports',
    id: reportId,
    ...system,
    disableErrors: true,
  })
  if (!decision) return { ok: false, message: 'Nie znaleźliśmy tej decyzji.' }
  const existing = await payload.count({
    collection: 'reports',
    where: { appealOf: { equals: reportId } },
    ...system,
  })
  if (existing.totalDocs) return { ok: false, message: 'Odwołanie od tej decyzji już wpłynęło.' }

  await payload.create({
    collection: 'reports',
    data: {
      targetType: decision.targetType,
      targetId: decision.targetId,
      targetTitle: decision.targetTitle,
      reason: 'appeal',
      description: data.description,
      reporterEmail: data.email,
      goodFaithConfirmed: true,
      appealOf: reportId,
      status: 'new',
    },
    ...system,
  })
  await confirm(payload, data.email, `odwołanie – ${decision.targetTitle ?? 'decyzja moderatora'}`)
  return { ok: true }
}
