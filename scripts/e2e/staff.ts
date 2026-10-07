/**
 * Tylko testy E2E: konto personelu bez skonfigurowanego 2FA (jak świeżo założone) – test przechodzi
 * konfigurację TOTP w panelu. Usuwa wcześniejsze konto o tym adresie. Wyłącznie lokalna baza.
 * Użycie: pnpm payload run scripts/e2e/staff.ts <e-mail> <hasło>
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const [email, password] = process.argv.slice(2)
const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!email || !password || !['localhost', '127.0.0.1'].includes(host))
  throw new Error('Tylko lokalna baza; podaj e-mail i hasło.')

const system = { overrideAccess: true, depth: 0 } as const
const payload = await getPayload({ config })
await payload.delete({ collection: 'staff', where: { email: { equals: email } }, ...system })
await payload.create({
  collection: 'staff',
  data: { email, name: 'Moderator E2E', role: 'moderator', password },
  ...system,
})
process.stdout.write('=> ok\n')
await payload.destroy()
process.exit(0)
