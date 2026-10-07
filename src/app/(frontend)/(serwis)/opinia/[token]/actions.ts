'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { clientIpHash } from '@/lib/auth/request'
import { rateLimit } from '@/lib/rate-limit'
import { findReviewTarget } from '@/lib/reviews/token'
import { reviewSchema } from '@/lib/validation/forms'

const EXPIRED = 'Ten link wygasł albo opinia została już wysłana.'

/**
 * Opinia z linku (SPEC 3.7): jedna na zapytanie (unikalny indeks), status „czeka na moderację”,
 * token kasowany po użyciu. Ocenę i treść zapisuje system – klient nie ma konta.
 */
export async function submitReviewAction(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const limit = await rateLimit('review', await clientIpHash())
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)

  const payload = await getPayload({ config })
  const target = await findReviewTarget(payload, parsed.data.token)
  if (!target) return { ok: false, message: EXPIRED }
  const { token: _token, ...review } = parsed.data

  try {
    await payload.create({
      collection: 'reviews',
      data: {
        ...review,
        firm: target.firm.id,
        inquiry: target.inquiry.id,
        status: 'pending',
      },
      overrideAccess: true,
    })
  } catch {
    // Unikalny indeks na `inquiry`: druga opinia z tego samego zapytania (np. dwa kliknięcia).
    return { ok: false, message: EXPIRED }
  }
  await payload.update({
    collection: 'inquiries',
    id: target.inquiry.id,
    data: { reviewTokenHash: null, reviewTokenExpiresAt: null },
    overrideAccess: true,
  })
  return { ok: true, message: 'Opinia wysłana.' }
}
