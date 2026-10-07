/**
 * Tylko testy E2E: wypisuje token weryfikacyjny konta (zamiast czytania skrzynki).
 * Działa wyłącznie na lokalnej bazie. Użycie: pnpm payload run scripts/e2e/verification-token.ts <email>
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const email = process.argv[2]
const host = new URL(process.env.DATABASE_URL ?? '').hostname
if (!email || !['localhost', '127.0.0.1'].includes(host))
  throw new Error('Tylko lokalna baza i podany e-mail.')

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'firmAccounts',
  where: { email: { equals: email } },
  showHiddenFields: true,
  overrideAccess: true,
  limit: 1,
})
process.stdout.write(`${docs[0]?._verificationToken ?? ''}\n`)
await payload.destroy()
process.exit(0)
