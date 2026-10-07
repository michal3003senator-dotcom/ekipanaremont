/**
 * Dane słownikowe: miejscowości łódzkiego (TERYT + PRNG) i usługi. Idempotentny – dopisuje brakujące.
 * Z argumentem `demo` dodaje przykładowe firmy, ale tylko na lokalnej bazie (nigdy na Neon).
 *
 * Użycie: pnpm seed            – słowniki
 *         pnpm seed demo       – słowniki + firmy przykładowe (lokalnie)
 */
import { readFileSync } from 'node:fs'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { addDays, todayInWarsaw } from '@/lib/format/date'

type LocalityRow = {
  terytId: string
  name: string
  type: 'wojewodztwo' | 'powiat' | 'gmina' | 'miejscowosc' | 'dzielnica'
  parent: string | null
  slug: string
  lat: number | null
  lng: number | null
}
type ServiceRow = { name: string; slug: string; icon: string; children: string[] }

const system = { overrideAccess: true, depth: 0 } as const
const CHUNK = 25

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

async function inChunks<T>(items: T[], task: (item: T) => Promise<unknown>) {
  for (let index = 0; index < items.length; index += CHUNK) {
    await Promise.all(items.slice(index, index + CHUNK).map(task))
  }
}

async function seedLocalities(payload: Payload) {
  const rows = readJson<LocalityRow[]>('data/teryt-lodzkie.json')
  const existing = await payload.find({
    collection: 'localities',
    pagination: false,
    select: { terytId: true },
    ...system,
  })
  const ids = new Map(existing.docs.map((doc) => [doc.terytId, doc.id]))
  let created = 0

  // Rodzic zawsze przed dziećmi: województwo → powiaty → gminy → miejscowości → dzielnice.
  for (const type of ['wojewodztwo', 'powiat', 'gmina', 'miejscowosc', 'dzielnica'] as const) {
    const missing = rows.filter((row) => row.type === type && !ids.has(row.terytId))
    await inChunks(missing, async ({ parent, ...row }) => {
      const doc = await payload.create({
        collection: 'localities',
        data: { ...row, parent: parent ? ids.get(parent) : null },
        ...system,
      })
      ids.set(row.terytId, doc.id)
      created += 1
    })
  }
  return created
}

async function seedServices(payload: Payload) {
  const rows = readJson<ServiceRow[]>('data/services.json')
  let created = 0
  for (const row of rows) {
    const found = await payload.find({
      collection: 'services',
      where: { slug: { equals: row.slug } },
      limit: 1,
      ...system,
    })
    const parent =
      found.docs[0] ??
      (await payload.create({
        collection: 'services',
        data: { name: row.name, slug: row.slug, icon: row.icon },
        ...system,
      }))
    if (!found.docs[0]) created += 1
    for (const name of row.children) {
      const child = await payload.find({
        collection: 'services',
        where: { name: { equals: name }, parent: { equals: parent.id } },
        limit: 1,
        ...system,
      })
      if (child.docs[0]) continue
      await payload.create({
        collection: 'services',
        data: { name, slug: `${row.slug}-${name}`, parent: parent.id },
        ...system,
      })
      created += 1
    }
  }
  return created
}

/** NIP-y z prefiksem 000 (nie istnieje taki urząd skarbowy) – nie trafimy w prawdziwą firmę. */
const DEMO_FIRMS = [
  { name: 'Płytka i Fuga', nip: '0000000017', service: 'glazurnik', locality: 'lodz', days: 3 },
  { name: 'Gładko Remonty', nip: '0000000023', service: 'malarz', locality: 'lodz', days: 9 },
  {
    name: 'Hydro-Serwis Zgierz',
    nip: '0000000046',
    service: 'hydraulik',
    locality: 'zgierz',
    days: 14,
  },
  {
    name: 'Remonty Bałuty',
    nip: '0000000052',
    service: 'remont-lazienki',
    locality: 'lodz',
    days: 21,
  },
  {
    name: 'Elektro Pabianice',
    nip: '0000000069',
    service: 'elektryk',
    locality: 'pabianice',
    days: 40,
  },
  {
    name: 'Suchy Tynk',
    nip: '0000000075',
    service: 'sucha-zabudowa',
    locality: 'piotrkow-trybunalski',
    days: null,
  },
] as const

function assertLocalDatabase() {
  const host = new URL(process.env.DATABASE_URL ?? '').hostname
  if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(host)) {
    throw new Error('Dane przykładowe tylko na lokalnej bazie.')
  }
}

async function seedDemo(payload: Payload) {
  assertLocalDatabase()
  const today = todayInWarsaw()
  let created = 0
  for (const firm of DEMO_FIRMS) {
    const exists = await payload.count({
      collection: 'firms',
      where: { nip: { equals: firm.nip } },
      ...system,
    })
    if (exists.totalDocs) continue
    const [service, locality] = await Promise.all([
      payload.find({
        collection: 'services',
        where: { slug: { equals: firm.service } },
        limit: 1,
        ...system,
      }),
      payload.find({
        collection: 'localities',
        where: { slug: { equals: firm.locality } },
        limit: 1,
        ...system,
      }),
    ])
    await payload.create({
      collection: 'firms',
      data: {
        name: firm.name,
        nip: firm.nip,
        status: 'active',
        subscriptionStatus: 'trial',
        registryVerifiedAt: new Date().toISOString(),
        shortDescription: 'Firma przykładowa do testów lokalnych.',
        services: service.docs.map((doc) => doc.id),
        baseLocality: locality.docs[0]?.id,
        serviceArea: locality.docs.map((doc) => doc.id),
        availability: { date: firm.days === null ? null : addDays(today, firm.days) },
      },
      context: { confirmAvailability: true },
      ...system,
    })
    created += 1
  }
  return created
}

const payload = await getPayload({ config })
const report = [
  `miejscowości: +${await seedLocalities(payload)}`,
  `usługi: +${await seedServices(payload)}`,
]
if (process.argv.includes('demo')) report.push(`firmy przykładowe: +${await seedDemo(payload)}`)
process.stdout.write(`Seed gotowy (${report.join(', ')}).\n`)
await payload.destroy()
process.exit(0)
