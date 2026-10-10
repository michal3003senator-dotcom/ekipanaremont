/**
 * Tylko testy E2E: profil firmy czekający na moderację. Wypisuje nazwę firmy. Wyłącznie lokalna baza.
 * Użycie: pnpm payload run scripts/e2e/moderation.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { isValidNip } from '@/lib/validation'

const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!['localhost', '127.0.0.1'].includes(host)) throw new Error('Tylko lokalna baza.')

const payload = await getPayload({ config })
const system = { overrideAccess: true, depth: 0 } as const

// Losowy poprawny NIP z prefiksem 000 (nie istnieje taki urząd skarbowy).
let nip = ''
while (!isValidNip(nip)) nip = `000${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`
const name = `Moderacja E2E ${nip.slice(-5)}`
await payload.create({
  collection: 'firms',
  data: {
    name,
    nip,
    status: 'pending_review',
    subscriptionStatus: 'trial',
    shortDescription: 'Profil testowy do zatwierdzenia z telefonu.',
  },
  ...system,
})
process.stdout.write(`=> ${name}\n`)
await payload.destroy()
process.exit(0)
