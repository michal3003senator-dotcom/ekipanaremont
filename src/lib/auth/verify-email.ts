import config from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

const VERIFY_WINDOW_MS = 24 * 60 * 60 * 1000

/** Weryfikacja e-maila z linku (strona `/potwierdz/[token]`). */
export async function verifyEmailToken(token: string): Promise<'verified' | 'expired' | 'invalid'> {
  if (
    !z
      .string()
      .regex(/^[a-f0-9]{20,80}$/)
      .safeParse(token).success
  )
    return 'invalid'
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firmAccounts',
    where: { _verificationToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })
  const account = docs[0]
  if (!account) return 'invalid'
  const sentAt = account.verificationSentAt ? new Date(account.verificationSentAt).getTime() : 0
  if (Date.now() - sentAt > VERIFY_WINDOW_MS) return 'expired'
  await payload.verifyEmail({ collection: 'firmAccounts', token })
  return 'verified'
}
