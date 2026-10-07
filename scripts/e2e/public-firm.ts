/**
 * Tylko testy E2E: aktywna firma „Glazura E2E” (Łódź, glazurnik, termin od dziś) z kontem firmy.
 * Idempotentny – przy kolejnym uruchomieniu odświeża termin i hasło. Wyłącznie lokalna baza.
 * Użycie: pnpm payload run scripts/e2e/public-firm.ts <e-mail konta> <hasło>
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { todayInWarsaw } from '@/lib/format/date'
import { isValidNip } from '@/lib/validation'

const [email, password] = process.argv.slice(2)
const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!email || !password || !['localhost', '127.0.0.1'].includes(host))
  throw new Error('Tylko lokalna baza; podaj e-mail i hasło konta.')

/** NIP z prefiksem 000 – poprawna suma kontrolna, nie istnieje w rejestrach. */
const nip = Array.from({ length: 100 }, (_, i) => String(9_999_000 + i).padStart(10, '0')).find(
  isValidNip,
)!

const system = { overrideAccess: true, depth: 0 } as const
const payload = await getPayload({ config })
const find = async (collection: 'services' | 'localities', slug: string) => {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    ...system,
  })
  if (!docs[0]) throw new Error(`Brak słownika „${slug}” – uruchom najpierw: pnpm seed`)
  return docs[0].id
}
const [service, locality] = await Promise.all([
  find('services', 'glazurnik'),
  find('localities', 'lodz'),
])

const data = {
  name: 'Glazura E2E',
  status: 'active' as const,
  subscriptionStatus: 'trial' as const,
  shortDescription: 'Firma do testów automatycznych.',
  services: [service],
  serviceArea: [locality],
  baseLocality: locality,
  phone: '600 100 200',
  availability: { date: todayInWarsaw() },
}
const { docs } = await payload.find({
  collection: 'firms',
  where: { nip: { equals: nip } },
  limit: 1,
  ...system,
})
const firm = docs[0]
  ? await payload.update({
      collection: 'firms',
      id: docs[0].id,
      data,
      context: { confirmAvailability: true },
      ...system,
    })
  : await payload.create({
      collection: 'firms',
      data: { ...data, nip },
      context: { confirmAvailability: true },
      ...system,
    })

const accounts = await payload.find({
  collection: 'firmAccounts',
  where: { email: { equals: email } },
  limit: 1,
  ...system,
})
if (accounts.docs[0])
  await payload.update({
    collection: 'firmAccounts',
    id: accounts.docs[0].id,
    data: { password, firm: firm.id },
    ...system,
  })
else
  await payload.create({
    collection: 'firmAccounts',
    data: { email, password, firm: firm.id, _verified: true },
    disableVerificationEmail: true,
    ...system,
  })

process.stdout.write(`=> ${firm.slug}\n`)
await payload.destroy()
process.exit(0)
