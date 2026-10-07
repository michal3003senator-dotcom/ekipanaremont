/**
 * Tylko testy E2E: publikuje kalkulator łazienki z parametrami testowymi i stronę „Jak sprawdzamy
 * opinie” (idempotentny). Wypisuje slug kalkulatora. Wyłącznie lokalna baza – na produkcji parametry wpisuje redakcja.
 * Użycie: pnpm payload run scripts/e2e/content.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!['localhost', '127.0.0.1'].includes(host)) throw new Error('Tylko lokalna baza.')

const system = { overrideAccess: true, depth: 0 } as const
const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'calculators',
  where: { type: { equals: 'bathroomCost' } },
  draft: true,
  limit: 1,
  ...system,
})
if (!docs[0]) throw new Error('Brak kalkulatora łazienki – uruchom najpierw: pnpm seed')

const calculator = await payload.update({
  collection: 'calculators',
  id: docs[0].id,
  data: {
    bathroomCost: {
      labourPerM2: { min: 100_000, max: 180_000 },
      materialsPerM2: { min: 80_000, max: 200_000 },
    },
    _status: 'published',
  },
  ...system,
})

const { docs: pages } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'jak-sprawdzamy-opinie' } },
  draft: true,
  limit: 1,
  ...system,
})
if (pages[0])
  await payload.update({
    collection: 'pages',
    id: pages[0].id,
    data: { _status: 'published' },
    ...system,
  })

process.stdout.write(`=> ${calculator.slug}\n`)
await payload.destroy()
process.exit(0)
