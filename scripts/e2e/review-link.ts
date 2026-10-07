/**
 * Tylko testy E2E: wysyła prośbę o opinię dla najnowszego zapytania klienta (bez czekania
 * `reviewDelayDays`) i wypisuje ścieżkę linku. Działa wyłącznie na lokalnej bazie.
 * Użycie: pnpm payload run scripts/e2e/review-link.ts <e-mail klienta>
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { requestReviewFor } from '@/jobs/reviews'
import { emailHash } from '@/lib/crypto'

const email = process.argv[2]
const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!email || !['localhost', '127.0.0.1'].includes(host))
  throw new Error('Tylko lokalna baza i podany e-mail.')

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'inquiries',
  where: { clientEmailHash: { equals: emailHash(email) } },
  sort: '-createdAt',
  depth: 1,
  limit: 1,
  overrideAccess: true,
})
const inquiry = docs[0]
if (!inquiry) throw new Error('Brak zapytania dla tego adresu.')
const token = await requestReviewFor(payload, inquiry)
process.stdout.write(`/opinia/${token}\n`)
await payload.destroy()
process.exit(0)
