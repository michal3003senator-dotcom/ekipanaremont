/**
 * Tylko testy E2E: redaktor z hasłem i ustawionym sekretem 2FA (TOTP), żeby test zalogował się
 * do panelu, licząc kod sam. Wypisuje sekret (base32). Wyłącznie lokalna baza.
 * Użycie: pnpm payload run scripts/e2e/editor.ts <e-mail> <hasło>
 */
import { randomBytes } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

const [email, password] = process.argv.slice(2)
const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!email || !password || !['localhost', '127.0.0.1'].includes(host))
  throw new Error('Tylko lokalna baza; podaj e-mail i hasło.')

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const secret = Array.from(randomBytes(20), (byte) => ALPHABET[byte % 32]).join('')

const payload = await getPayload({ config })
const system = { overrideAccess: true, depth: 0 } as const
// Pierwsze konto personelu dostaje rolę admin (hook) – przy pustej bazie zakładamy je wcześniej.
if ((await payload.count({ collection: 'staff', ...system })).totalDocs === 0) {
  await payload.create({
    collection: 'staff',
    data: {
      email: `admin-${secret.slice(0, 6).toLowerCase()}@ekipa.test`,
      name: 'Admin E2E',
      role: 'admin',
      password,
    },
    ...system,
  })
}
const { docs } = await payload.find({
  collection: 'staff',
  where: { email: { equals: email } },
  limit: 1,
  ...system,
})
const data = { name: 'Redakcja E2E', role: 'editor' as const, password, totpSecret: secret }
if (docs[0]) await payload.update({ collection: 'staff', id: docs[0].id, data, ...system })
else await payload.create({ collection: 'staff', data: { ...data, email }, ...system })

process.stdout.write(`=> ${secret}\n`)
await payload.destroy()
process.exit(0)
