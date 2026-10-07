import { randomBytes } from 'node:crypto'

import type { Payload } from 'payload'

import { hmacFor } from '@/lib/crypto'
import type { Firm, Inquiry, Locality } from '@/payload-types'

/** Link do opinii działa 30 dni (SPEC 3.6). */
export const REVIEW_LINK_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Losowy token do linku; w bazie tylko jego skrót HMAC (`reviewTokenHash`). */
export const newReviewToken = () => randomBytes(24).toString('base64url')
export const reviewTokenHash = (token: string) => hmacFor('token', token)
export const reviewLinkExpiry = (now = Date.now()) =>
  new Date(now + REVIEW_LINK_DAYS * DAY_MS).toISOString()

export const REVIEW_TOKEN = /^[\w-]{20,64}$/

export type ReviewTarget = {
  inquiry: Inquiry
  firm: Pick<Firm, 'id' | 'name' | 'slug'>
  /** Podpowiedź podpisu: „Anna, Zgierz” – klient i tak ją zmienia. */
  suggestedSignature: string
}

/** Zapytanie z ważnym linkiem do opinii; `null` – link wygasł, zużyty albo nie istnieje. */
export async function findReviewTarget(
  payload: Payload,
  token: string,
): Promise<ReviewTarget | null> {
  if (!REVIEW_TOKEN.test(token)) return null
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: {
      reviewTokenHash: { equals: reviewTokenHash(token) },
      reviewTokenExpiresAt: { greater_than: new Date().toISOString() },
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const inquiry = docs[0]
  const firm = inquiry?.firm
  if (!inquiry || !firm || typeof firm !== 'object') return null
  const locality = (inquiry.locality as Locality | null | undefined)?.name
  const firstName = inquiry.clientName.trim().split(/\s+/)[0] ?? ''
  return {
    inquiry,
    firm: { id: firm.id, name: firm.name, slug: firm.slug },
    suggestedSignature: [firstName, locality].filter(Boolean).join(', '),
  }
}
