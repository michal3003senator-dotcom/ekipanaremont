import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { FirmAccount } from '@/payload-types'

export type FirmSession = FirmAccount & { collection: 'firmAccounts' }

/** Zalogowane konto firmy z ciasteczka sesji albo `null` (personel nie jest firmą). */
export async function getFirmSession(): Promise<FirmSession | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user?.collection === 'firmAccounts' ? (user as FirmSession) : null
}

/** Strona tylko dla firm: bez sesji przekierowanie do logowania z powrotem na `next`. */
export async function requireFirm(next = '/panel'): Promise<FirmSession> {
  const session = await getFirmSession()
  if (!session) redirect(`/logowanie?next=${encodeURIComponent(next)}`)
  return session
}
