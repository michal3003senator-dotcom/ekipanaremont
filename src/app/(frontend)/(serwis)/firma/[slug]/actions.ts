'use server'

import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'
import { z } from 'zod'

import { sendEmail, siteUrl } from '@/emails/send'
import { inquiryConfirmation, newInquiry } from '@/emails/templates'
import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { clientIpHash } from '@/lib/auth/request'
import { UPLOAD_IMAGE_TYPES } from '@/lib/images'
import { INQUIRY_MAX_PHOTOS, INQUIRY_PHOTO_MAX_BYTES, TIMEFRAMES } from '@/lib/inquiry/options'
import { consentVersion } from '@/lib/legal'
import { rateLimit } from '@/lib/rate-limit'
import { bumpStat } from '@/lib/stats'
import { verifyTurnstile } from '@/lib/turnstile'
import { inquirySchema } from '@/lib/validation/forms'
import type { Firm } from '@/payload-types'

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(140)

/** Aktywna firma po adresie (reguła dostępu gościa), numer telefonu – odczyt systemowy. */
async function activeFirm(slug: unknown) {
  const parsed = slugSchema.safeParse(slug)
  if (!parsed.success) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firms',
    where: { slug: { equals: parsed.data } },
    select: { slug: true },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  if (!docs[0]) return null
  const firm = await payload.findByID({
    collection: 'firms',
    id: docs[0].id,
    select: { phone: true },
    depth: 0,
    overrideAccess: true,
  })
  return { payload, firm }
}

/** „Pokaż numer telefonu” (SPEC 3.2): numer nie trafia do HTML strony, każde pokazanie jest liczone. */
export async function revealPhoneAction(
  slug: unknown,
): Promise<{ ok: true; phone: string } | { ok: false; message: string }> {
  const limit = await rateLimit('phone', await clientIpHash())
  if (!limit.ok) return { ok: false, message: 'Za dużo prób. Spróbuj za kilka minut.' }
  const found = await activeFirm(slug)
  if (!found?.firm.phone) return { ok: false, message: 'Ta firma nie podała numeru telefonu.' }
  await bumpStat(found.payload, found.firm.id, 'phoneReveals')
  return { ok: true, phone: found.firm.phone }
}

/** Wyświetlenie profilu: wywoływane z przeglądarki raz na sesję (bez botów i prefetchu). */
export async function recordViewAction(slug: unknown): Promise<void> {
  const limit = await rateLimit('view', await clientIpHash())
  if (!limit.ok) return
  const found = await activeFirm(slug)
  if (found) await bumpStat(found.payload, found.firm.id, 'views')
}

const BOT_CHECK =
  'Nie udało się potwierdzić, że nie jesteś botem. Odśwież stronę i spróbuj ponownie.'

/** Dane formularza z FormData: pola jako JSON w `data`, zdjęcia jako pliki `photos`. */
function readForm(formData: FormData) {
  let data: unknown = null
  try {
    const raw = formData.get('data')
    data = typeof raw === 'string' && raw.length < 20_000 ? JSON.parse(raw) : null
  } catch {
    data = null
  }
  const photos = formData.getAll('photos').filter((file): file is File => file instanceof File)
  return { data, photos }
}

const photoError = (photos: File[]) => {
  if (photos.length > INQUIRY_MAX_PHOTOS) return `Dodaj najwyżej ${INQUIRY_MAX_PHOTOS} zdjęć.`
  const wrong = photos.some(
    (file) =>
      file.size === 0 || file.size > INQUIRY_PHOTO_MAX_BYTES || !UPLOAD_IMAGE_TYPES.has(file.type),
  )
  return wrong ? 'Zdjęcia muszą być w formacie JPG, PNG, WebP lub AVIF.' : null
}

/** Zdjęcia zapytania: widoczne tylko dla firmy-adresata i administratora (`purpose: inquiry`). */
async function storePhotos(payload: Payload, firmId: string, photos: File[]) {
  const ids: string[] = []
  for (const [index, file] of photos.entries()) {
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Zdjęcie do zapytania ${index + 1}`, purpose: 'inquiry', firm: firmId },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name || `zapytanie-${index + 1}.webp`,
        size: file.size,
      },
      overrideAccess: true,
    })
    ids.push(media.id)
  }
  return ids
}

/** Powiadomienia po zapisie. Błąd poczty nie cofa zapytania (firma i tak widzi je w panelu). */
async function notify(
  payload: Payload,
  firm: Firm,
  inquiryId: string,
  subject: string,
  clientEmail: string,
) {
  const { docs: accounts } = await payload.find({
    collection: 'firmAccounts',
    where: { firm: { equals: firm.id }, 'notificationPrefs.inquiries': { not_equals: false } },
    depth: 0,
    limit: 5,
    overrideAccess: true,
  })
  const emails = [
    ...accounts.map((account) =>
      sendEmail(
        payload,
        account.email,
        newInquiry(siteUrl(`/panel/zapytania/${inquiryId}`), subject),
      ),
    ),
    sendEmail(payload, clientEmail, inquiryConfirmation(firm.name, siteUrl(`/firma/${firm.slug}`))),
  ]
  const results = await Promise.allSettled(emails)
  if (results.some((result) => result.status === 'rejected'))
    payload.logger.warn({ msg: 'Nie wysłano części e-maili o zapytaniu', inquiryId })
}

/**
 * Zapytanie z profilu (SPEC 3.6): Zod, limit 5/h na skrót IP, Turnstile, zdjęcia (max 5),
 * zapis przez Local API (szyfrowanie w hookach pól), statystyka, e-maile, przekierowanie.
 */
export async function sendInquiryAction(formData: FormData): Promise<ActionResult> {
  const { data, photos } = readForm(formData)
  const parsed = inquirySchema.safeParse(data)
  if (!parsed.success) return invalid(parsed.error)
  const input = parsed.data

  const ipHash = await clientIpHash()
  const limit = await rateLimit('inquiry', ipHash)
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  if (!(await verifyTurnstile(input.turnstileToken))) return { ok: false, message: BOT_CHECK }
  const invalidPhotos = photoError(photos)
  if (invalidPhotos) return { ok: false, fieldErrors: { photos: invalidPhotos } }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firms',
    where: { slug: { equals: input.firm } },
    depth: 1,
    limit: 1,
    overrideAccess: false,
  })
  const firm = docs[0]
  if (!firm) return { ok: false, message: 'Ta firma nie przyjmuje teraz zapytań.' }

  const services = (firm.services ?? []).filter((service) => typeof service === 'object')
  const service = services.find((item) => item.id === input.service)
  if (input.service && !service)
    return { ok: false, fieldErrors: { service: 'Wybierz usługę z listy.' } }
  const { docs: places } = await payload.find({
    collection: 'localities',
    where: { slug: { equals: input.locality } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const locality = places[0]
  if (!locality) return { ok: false, fieldErrors: { locality: 'Wybierz miejscowość z listy.' } }

  const images = await storePhotos(payload, firm.id, photos)
  let inquiryId: string
  try {
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        firm: firm.id,
        service: service?.id,
        locality: locality.id,
        description: input.description,
        budgetRange: input.budgetRange,
        timeframe: TIMEFRAMES[input.timeframe],
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        images,
        consentTextVersion: await consentVersion(payload, 'inquiry'),
        consentAt: new Date().toISOString(),
        status: 'new',
        source: 'direct',
        ipHash,
      },
      overrideAccess: true,
    })
    inquiryId = inquiry.id
  } catch (error) {
    if (images.length)
      await payload.delete({
        collection: 'media',
        where: { id: { in: images } },
        overrideAccess: true,
      })
    throw error
  }

  await bumpStat(payload, firm.id, 'inquiries')
  const subject = [service?.name, locality.name].filter(Boolean).join(', ')
  await notify(payload, firm, inquiryId, subject, input.clientEmail)
  redirect(`/firma/${firm.slug}/wyslane`)
}
