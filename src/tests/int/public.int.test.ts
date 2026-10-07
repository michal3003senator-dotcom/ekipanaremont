import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '../../payload.config'

let ip = '198.51.100.20'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': ip }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const profile = await import('../../app/(frontend)/(serwis)/firma/[slug]/actions')
const review = await import('../../app/(frontend)/(serwis)/opinia/[token]/actions')
const { searchFirms } = await import('../../lib/search/firms')
const { bumpStat } = await import('../../lib/stats')
const { requestReviewFor } = await import('../../jobs/reviews')
const { addDays, todayInWarsaw } = await import('../../lib/format/date')
const { outbox } = await import('../../lib/email/adapter')
const { resetMemoryLimits } = await import('../../lib/rate-limit')

const system = { overrideAccess: true, depth: 0 } as const
const today = todayInWarsaw()
let payload: Payload
const ids = {} as Record<
  'service' | 'subservice' | 'center' | 'near' | 'far' | 'soon' | 'later' | 'none',
  string
>
const FIRM_EMAIL = 'publiczne@firma.test'

const db = () => (payload.db as unknown as PostgresAdapter).drizzle

/** NIP z poprawną sumą kontrolną (prefiks 0077 – poza rejestrami i innymi testami). */
function nip(seed: number): string {
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  for (let n = 7_700_000 + seed * 20; ; n += 1) {
    const base = String(n).padStart(9, '0')
    const sum = weights.reduce((total, weight, i) => total + weight * Number(base[i]), 0) % 11
    if (sum < 10) return `${base}${sum}`
  }
}

async function locality(name: string, terytId: string, lat: number, lng: number) {
  const doc = await payload.create({
    collection: 'localities',
    data: { terytId, name, type: 'miejscowosc', lat, lng },
    ...system,
  })
  return doc.id
}

async function firm(
  name: string,
  seed: number,
  {
    days,
    area,
    service = ids.service,
    vat = false,
    status = 'active',
  }: {
    days: number | null
    area: string
    service?: string
    vat?: boolean
    status?: 'active' | 'suspended'
  },
) {
  const doc = await payload.create({
    collection: 'firms',
    data: {
      name,
      nip: nip(seed),
      status,
      subscriptionStatus: 'trial',
      vatInvoice: vat,
      phone: '600 100 200',
      services: [service],
      serviceArea: [area],
      baseLocality: area,
      availability: { date: days === null ? null : addDays(today, days) },
    },
    context: { confirmAvailability: true },
    ...system,
  })
  return doc.id
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const service = await payload.create({
    collection: 'services',
    data: { name: 'Kafelkowanie testowe' },
    ...system,
  })
  ids.service = service.id
  const sub = await payload.create({
    collection: 'services',
    data: { name: 'Fugowanie testowe', parent: service.id },
    ...system,
  })
  ids.subservice = sub.id
  // Środek, miejscowość ok. 8 km dalej i ok. 60 km dalej.
  ids.center = await locality('Testowo', '9900001', 51.75, 19.45)
  ids.near = await locality('Testowo Małe', '9900002', 51.82, 19.45)
  ids.far = await locality('Daleko', '9900003', 51.2, 19.45)
  ids.soon = await firm('Szybka Ekipa', 1, { days: 2, area: ids.near, vat: true })
  ids.later = await firm('Późna Ekipa', 2, { days: 20, area: ids.center })
  ids.none = await firm('Bez Terminu', 3, { days: null, area: ids.center })
  await firm('Tylko Fugi', 4, { days: 5, area: ids.center, service: ids.subservice })
  await firm('Szybka Daleko', 5, { days: 1, area: ids.far })
  await firm('Zawieszona', 6, { days: 1, area: ids.center, status: 'suspended' })
  await payload.create({
    collection: 'firmAccounts',
    data: {
      email: FIRM_EMAIL,
      password: 'Fuga-Gres-Kielnia-48!',
      firm: ids.later,
      _verified: true,
    },
    disableVerificationEmail: true,
    ...system,
  })
})
beforeEach(() => resetMemoryLimits())
afterAll(async () => {
  await payload.destroy()
})

const names = async (found: { ids: string[] }) => {
  const { docs } = await payload.find({
    collection: 'firms',
    where: { id: { in: found.ids } },
    ...system,
  })
  const byId = new Map(docs.map((doc) => [doc.id, doc.name]))
  return found.ids.map((id) => byId.get(id))
}

describe('searchFirms', () => {
  const base = () => ({ today, expiryDays: 14, serviceIds: [ids.service, ids.subservice] })

  it('tylko aktywne firmy z obszaru, od najbliższego terminu, bez terminu na końcu', async () => {
    const found = await searchFirms(payload, { ...base(), localityId: ids.center })
    expect(await names(found)).toEqual(['Tylko Fugi', 'Późna Ekipa', 'Bez Terminu'])
    expect(found.total).toBe(3)
  })

  it('promień obejmuje sąsiednie miejscowości, ale nie odległe', async () => {
    const found = await searchFirms(payload, { ...base(), localityId: ids.center, radiusKm: 10 })
    expect(await names(found)).toEqual(['Szybka Ekipa', 'Tylko Fugi', 'Późna Ekipa', 'Bez Terminu'])
  })

  it('filtry: termin do 7 dni, faktura VAT, wykluczenie bieżącej firmy', async () => {
    const near = { ...base(), localityId: ids.center, radiusKm: 10 }
    expect(await names(await searchFirms(payload, { ...near, withinDays: 7 }))).toEqual([
      'Szybka Ekipa',
      'Tylko Fugi',
    ])
    expect(await names(await searchFirms(payload, { ...near, vat: true }))).toEqual([
      'Szybka Ekipa',
    ])
    expect(
      await names(await searchFirms(payload, { ...near, withinDays: 7, excludeId: ids.soon })),
    ).toEqual(['Tylko Fugi'])
  })

  it('podusługa zawęża wyniki do firm, które ją wykonują', async () => {
    const parentOnly = await searchFirms(payload, {
      today,
      expiryDays: 14,
      serviceIds: [ids.subservice],
      localityId: ids.center,
    })
    expect(await names(parentOnly)).toEqual(['Tylko Fugi'])
  })

  it('termin potwierdzony dawno temu nie jest aktywny', async () => {
    await db().execute(
      sql`UPDATE firms SET availability_confirmed_at = now() - interval '30 days' WHERE id = ${ids.later}::uuid`,
    )
    const found = await searchFirms(payload, { ...base(), localityId: ids.center, withinDays: 30 })
    expect(await names(found)).toEqual(['Tylko Fugi'])
    await db().execute(
      sql`UPDATE firms SET availability_confirmed_at = now() WHERE id = ${ids.later}::uuid`,
    )
  })
})

describe('statystyki', () => {
  it('równoległe zwiększenia licznika nie gubią się i dają jeden wiersz na dzień', async () => {
    await Promise.all(Array.from({ length: 20 }, () => bumpStat(payload, ids.none, 'views')))
    const { docs } = await payload.find({
      collection: 'firmStatsDaily',
      where: { firm: { equals: ids.none } },
      ...system,
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ views: 20, date: today })
  })

  it('„Pokaż numer” zwraca telefon i liczy pokazanie', async () => {
    const result = await profile.revealPhoneAction('bez-terminu')
    expect(result).toEqual({ ok: true, phone: '600 100 200' })
    const { docs } = await payload.find({
      collection: 'firmStatsDaily',
      where: { firm: { equals: ids.none } },
      ...system,
    })
    expect(docs[0]?.phoneReveals).toBe(1)
    expect(await profile.revealPhoneAction('zawieszona')).toMatchObject({ ok: false })
  })
})

async function inquiryForm(patch: Record<string, unknown> = {}, photos: Blob[] = []) {
  const form = new FormData()
  form.set(
    'data',
    JSON.stringify({
      firm: 'pozna-ekipa',
      service: ids.service,
      locality: 'testowo',
      description: 'Nowa glazura w łazience, około 6 m2, skucie starych płytek.',
      budgetRange: 'from10to30k',
      timeframe: 'month',
      clientName: 'Anna',
      clientEmail: 'anna.klientka@example.com',
      consent: true,
      ...patch,
    }),
  )
  photos.forEach((photo, index) => form.append('photos', photo, `zdjecie-${index}.webp`))
  return form
}

const webp = async () =>
  new Blob(
    [
      new Uint8Array(
        await sharp({ create: { width: 40, height: 30, channels: 3, background: '#888' } })
          .webp()
          .toBuffer(),
      ),
    ],
    { type: 'image/webp' },
  )

describe('sendInquiryAction', () => {
  it('zapisuje zaszyfrowane zapytanie, zdjęcie tylko dla firmy, e-mail do firmy bez danych klienta', async () => {
    const before = outbox.length
    await expect(profile.sendInquiryAction(await inquiryForm({}, [await webp()]))).rejects.toThrow(
      'REDIRECT:/firma/pozna-ekipa/wyslane',
    )
    const raw = await db().execute<{ description: string; client_email: string; id: string }>(
      sql`SELECT id, description, client_email FROM inquiries WHERE firm_id = ${ids.later}::uuid ORDER BY created_at DESC LIMIT 1`,
    )
    const row = raw.rows[0]!
    expect(row.description).toMatch(/^enc:v\d+:/)
    expect(row.client_email).toMatch(/^enc:v\d+:/)

    const inquiry = await payload.findByID({ collection: 'inquiries', id: row.id, ...system })
    expect(inquiry).toMatchObject({ clientName: 'Anna', timeframe: 'W ciągu miesiąca' })
    const mediaId = inquiry.images?.[0] as string
    await expect(
      payload.findByID({ collection: 'media', id: mediaId, overrideAccess: false }),
    ).rejects.toThrow()

    const sent = outbox.slice(before)
    const toFirm = sent.find((message) => message.to === FIRM_EMAIL)
    const toClient = sent.find((message) => message.to === 'anna.klientka@example.com')
    expect(toFirm).toBeDefined()
    expect(toClient).toBeDefined()
    for (const part of [toFirm?.html, toFirm?.text, toFirm?.subject])
      expect(String(part)).not.toMatch(/Anna|anna\.klientka|glazura w łazience/)

    const { docs } = await payload.find({
      collection: 'firmStatsDaily',
      where: { firm: { equals: ids.later } },
      ...system,
    })
    expect(docs[0]?.inquiries).toBe(1)
  })

  it('odrzuca błędne dane, zawieszoną firmę i 6. zapytanie z tego samego IP w godzinie', async () => {
    ip = '198.51.100.21'
    expect(
      await profile.sendInquiryAction(await inquiryForm({ description: 'krótko' })),
    ).toMatchObject({ ok: false, fieldErrors: { description: expect.any(String) } })
    expect(
      await profile.sendInquiryAction(await inquiryForm({ firm: 'zawieszona' })),
    ).toMatchObject({
      ok: false,
    })
    // Limit 5/h: zapytanie do zawieszonej firmy też się liczy (limit przed wyszukaniem firmy).
    for (let attempt = 0; attempt < 4; attempt += 1)
      await profile.sendInquiryAction(await inquiryForm()).catch(() => undefined)
    expect(await profile.sendInquiryAction(await inquiryForm())).toMatchObject({
      ok: false,
      message: expect.stringContaining('Za dużo prób'),
    })
  })
})

describe('opinie z linku', () => {
  it('jedna opinia na zapytanie, status „czeka na moderację”, token jednorazowy', async () => {
    const { docs } = await payload.find({
      collection: 'inquiries',
      where: { firm: { equals: ids.later } },
      sort: '-createdAt',
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const token = await requestReviewFor(payload, docs[0]!)
    const stored = await payload.findByID({
      collection: 'inquiries',
      id: docs[0]!.id,
      showHiddenFields: true,
      ...system,
    })
    expect(stored.reviewTokenHash).toMatch(/^[0-9a-f]{64}$/)
    expect(stored.reviewTokenHash).not.toContain(token)

    const input = {
      token,
      rating: 4,
      body: 'Dobry kontakt i wycena w dwa dni. Prace zgodnie z planem.',
      authorDisplayName: 'Anna, Testowo',
    }
    expect(await review.submitReviewAction(input)).toMatchObject({ ok: true })
    expect(await review.submitReviewAction(input)).toMatchObject({ ok: false })

    const reviews = await payload.find({
      collection: 'reviews',
      where: { inquiry: { equals: docs[0]!.id } },
      ...system,
    })
    expect(reviews.docs).toHaveLength(1)
    expect(reviews.docs[0]).toMatchObject({ status: 'pending', rating: 4, firm: ids.later })
    const published = await payload.find({
      collection: 'reviews',
      where: { inquiry: { equals: docs[0]!.id } },
      overrideAccess: false,
    })
    expect(published.docs).toHaveLength(0)
  })
})
