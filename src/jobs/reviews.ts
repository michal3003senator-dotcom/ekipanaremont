import type { Payload, PayloadRequest, TaskConfig } from 'payload'

import { sendEmail, siteUrl } from '@/emails/send'
import { reviewRequest } from '@/emails/templates'
import { newReviewToken, reviewLinkExpiry, reviewTokenHash } from '@/lib/reviews/token'
import type { Firm, Inquiry } from '@/payload-types'

const DAY_MS = 24 * 60 * 60 * 1000
/** Najwyżej tyle próśb w jednym przebiegu – reszta następnego dnia. */
const BATCH = 200

/**
 * Prośba o opinię dla jednego zapytania: nowy token (w bazie tylko skrót), e-mail z linkiem.
 * Gdy e-mail nie wyjdzie, znacznik wysyłki wraca do pustego – zadanie spróbuje jutro.
 */
export async function requestReviewFor(
  payload: Payload,
  inquiry: Pick<Inquiry, 'id' | 'clientEmail' | 'firm'>,
  req?: PayloadRequest,
): Promise<string> {
  const token = newReviewToken()
  const update = (data: Partial<Inquiry>) =>
    payload.update({
      collection: 'inquiries',
      id: inquiry.id,
      data,
      overrideAccess: true,
      context: { skipAudit: true },
      req,
    })
  await update({
    reviewTokenHash: reviewTokenHash(token),
    reviewTokenExpiresAt: reviewLinkExpiry(),
    reviewRequestedAt: new Date().toISOString(),
  })
  const firmName = typeof inquiry.firm === 'object' ? (inquiry.firm as Firm).name : 'firma'
  try {
    await sendEmail(
      payload,
      inquiry.clientEmail,
      reviewRequest(siteUrl(`/opinia/${token}`), firmName),
    )
  } catch (error) {
    await update({ reviewTokenHash: null, reviewTokenExpiresAt: null, reviewRequestedAt: null })
    throw error
  }
  return token
}

/** Po `reviewDelayDays` od zapytania: jednorazowy link do opinii (SPEC 3.6). Bez spamu. */
export const requestReviews: TaskConfig<{ input: object; output: { sent: number } }> = {
  slug: 'requestReviews',
  label: 'Prośby o opinię po zapytaniu',
  schedule: [{ cron: '0 15 2 * * *', queue: 'daily' }],
  retries: 2,
  handler: async ({ req }) => {
    const { reviewDelayDays = 14 } = await req.payload.findGlobal({
      slug: 'settings',
      depth: 0,
      overrideAccess: true,
      req,
    })
    const { docs } = await req.payload.find({
      collection: 'inquiries',
      where: {
        createdAt: {
          less_than_equal: new Date(Date.now() - (reviewDelayDays ?? 14) * DAY_MS).toISOString(),
        },
        reviewRequestedAt: { exists: false },
        status: { not_equals: 'spam' },
      },
      depth: 1,
      limit: BATCH,
      sort: 'createdAt',
      overrideAccess: true,
      req,
    })
    let sent = 0
    for (const inquiry of docs) {
      try {
        await requestReviewFor(req.payload, inquiry, req)
        sent += 1
      } catch {
        req.payload.logger.warn({ msg: 'Nie wysłano prośby o opinię', inquiryId: inquiry.id })
      }
    }
    return { output: { sent } }
  },
}
