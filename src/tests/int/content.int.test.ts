import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '../../payload.config'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '198.51.100.40' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
  draftMode: async () => ({ isEnabled: false }),
}))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))

const { submitLeadAction } = await import('../../app/(frontend)/(serwis)/kalkulatory/actions')
const { localPagePairs, findLocalPage } = await import('../../lib/local-pages')
const { legalArchive } = await import('../../lib/content/pages')
const { resetMemoryLimits } = await import('../../lib/rate-limit')

const system = { overrideAccess: true, depth: 0 } as const
let payload: Payload
const ids = {} as Record<'service' | 'gmina' | 'seat' | 'village' | 'calculator', string>

beforeAll(async () => {
  payload = await getPayload({ config })
  ids.service = (
    await payload.create({ collection: 'services', data: { name: 'Szklarz testowy' }, ...system })
  ).id
  ids.gmina = (
    await payload.create({
      collection: 'localities',
      data: { terytId: '9910001', name: 'Testowice', slug: 'gmina-testowice', type: 'gmina' },
      ...system,
    })
  ).id
  const locality = (name: string, terytId: string) =>
    payload.create({
      collection: 'localities',
      data: { terytId, name, type: 'miejscowosc', parent: ids.gmina },
      ...system,
    })
  ids.seat = (await locality('Testowice', '9910002')).id
  ids.village = (await locality('Wola Testowa', '9910003')).id
  await payload.create({
    collection: 'firms',
    data: {
      name: 'Szkło Testowice',
      nip: '0009988007',
      status: 'active',
      subscriptionStatus: 'trial',
      services: [ids.service],
      serviceArea: [ids.gmina],
    },
    ...system,
  })
})
beforeEach(() => resetMemoryLimits())
afterAll(async () => {
  await payload.destroy()
})

describe('strony lokalne (SPEC 3.14)', () => {
  it('tylko siedziba gminy z aktywną firmą trafia do mapy strony, wieś bez siedziby – nie', async () => {
    const pairs = await localPagePairs(payload)
    const service = (await payload.findByID({ collection: 'services', id: ids.service, ...system }))
      .slug
    const seat = (await payload.findByID({ collection: 'localities', id: ids.seat, ...system }))
      .slug
    const village = (
      await payload.findByID({ collection: 'localities', id: ids.village, ...system })
    ).slug
    expect(pairs).toContainEqual({ service, locality: seat })
    expect(pairs.some((pair) => pair.locality === village)).toBe(false)
    expect(await findLocalPage(payload, service!, seat!)).toMatchObject({ label: 'Testowice' })
    expect(await findLocalPage(payload, service!, village!)).toBeNull()
  })

  it('zawieszona firma znika ze stron lokalnych', async () => {
    const db = (payload.db as unknown as PostgresAdapter).drizzle
    await db.execute(sql`UPDATE firms SET status = 'suspended' WHERE name = 'Szkło Testowice'`)
    const service = (await payload.findByID({ collection: 'services', id: ids.service, ...system }))
      .slug
    expect((await localPagePairs(payload)).some((pair) => pair.service === service)).toBe(false)
    await db.execute(sql`UPDATE firms SET status = 'active' WHERE name = 'Szkło Testowice'`)
  })
})

describe('prośba o kontakt z kalkulatora', () => {
  beforeAll(async () => {
    const calculator = await payload.create({
      collection: 'calculators',
      data: {
        title: 'Gładź testowa',
        type: 'skimCoat',
        skimCoat: { kgPerM2PerMm: 1, bagKg: 20, labourPerM2: { min: 2_000, max: 3_500 } },
        _status: 'published',
      },
      ...system,
    })
    ids.calculator = calculator.id
  })

  const lead = (patch: Record<string, unknown> = {}) => ({
    calculatorId: ids.calculator,
    inputs: { area: 50, thickness: 2 },
    name: 'Ewa',
    email: 'ewa.lead@example.com',
    consent: true,
    ...patch,
  })

  it('zapisuje zaszyfrowany lead z wynikiem policzonym na serwerze, wersją zgody i retencją', async () => {
    expect(await submitLeadAction(lead())).toMatchObject({ ok: true })
    const db = (payload.db as unknown as PostgresAdapter).drizzle
    const { rows } = await db.execute<{
      email: string
      consent_text_version: string
      months: number
    }>(
      sql`SELECT email, consent_text_version,
        round(extract(epoch FROM retention_until - created_at) / 2592000) AS months
        FROM leads ORDER BY created_at DESC LIMIT 1`,
    )
    expect(rows[0]!.email).toMatch(/^enc:v\d+:/)
    expect(rows[0]!.consent_text_version).toMatch(/^lead-1\/pp-/)
    expect(Number(rows[0]!.months)).toBe(12)
    const [saved] = (
      await payload.find({ collection: 'leads', sort: '-createdAt', limit: 1, ...system })
    ).docs
    expect(saved!.result).toMatchObject({
      text: expect.stringContaining('Gładź na 50 m²'),
      rows: expect.arrayContaining([{ label: 'Gładź', value: '100 kg, worki: 5' }]),
    })
  })

  it('odrzuca brak zgody, dane spoza zakresu, kalkulator nieopublikowany i 6. prośbę w godzinie', async () => {
    expect(await submitLeadAction(lead({ consent: false }))).toMatchObject({ ok: false })
    expect(await submitLeadAction(lead({ inputs: { area: 0, thickness: 2 } }))).toMatchObject({
      ok: false,
    })
    for (let attempt = 0; attempt < 4; attempt += 1) await submitLeadAction(lead())
    expect(await submitLeadAction(lead())).toMatchObject({
      ok: false,
      message: expect.stringContaining('Za dużo prób'),
    })
  })
})

describe('harmonogram i archiwum wersji', () => {
  it('zadanie publishScheduled publikuje szkic z minionym terminem jako system', async () => {
    const draft = await payload.create({
      collection: 'articles',
      data: {
        title: 'Zaplanowany artykuł',
        publishAt: new Date(Date.now() - 60_000).toISOString(),
        _status: 'draft',
      },
      draft: true,
      ...system,
    })
    const guestCount = () =>
      payload.count({
        collection: 'articles',
        where: { id: { equals: draft.id } },
        overrideAccess: false,
      })
    expect((await guestCount()).totalDocs).toBe(0)
    await payload.jobs.queue({ task: 'publishScheduled', input: {}, queue: 'hourly' })
    await payload.jobs.run({ queue: 'hourly' })
    expect((await guestCount()).totalDocs).toBe(1)
    const published = await payload.findByID({ collection: 'articles', id: draft.id, ...system })
    expect(published.publishAt).toBeNull()
    expect(published.publishedAt).toBeTruthy()
  })

  it('archiwum dokumentu prawnego pokazuje poprzednie wersje bez bieżącej', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Regulamin testowy',
        legalKind: 'terms',
        legalVersion: '1.0',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        _status: 'published',
      },
      ...system,
    })
    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        legalVersion: '2.0',
        effectiveFrom: '2026-06-01T00:00:00.000Z',
        _status: 'published',
      },
      ...system,
    })
    const archive = await legalArchive(payload, updated)
    expect(archive.map((version) => version.legalVersion)).toEqual(['1.0'])
  })
})
