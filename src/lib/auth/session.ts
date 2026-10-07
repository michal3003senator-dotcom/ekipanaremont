import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { FirmAccount } from '@/payload-types'

export type FirmSession = FirmAccount & { collection: 'firmAccounts' }

/** Zalogowane konto firmy z ciasteczka sesji albo `null` (personel nie jest firmą). */
export async function getFirmSession(): Promise<FirmSession | null> {
  const payload = await getPayload({ config })
  // Payload odrzuca ciasteczko sesji przy `Sec-Fetch-Site: cross-site` (ochrona CSRF dla REST),
  // więc wejście z linku w poczcie wyglądałoby na wylogowanie. Tu to bezpieczne: strony tylko
  // czytają (odpowiedzi nie odczyta obca witryna), a Server Actions Next sprawdza po Origin.
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('sec-fetch-site', 'same-origin')
  requestHeaders.delete('origin')
  const { user } = await payload.auth({ headers: requestHeaders })
  return user?.collection === 'firmAccounts' ? (user as FirmSession) : null
}

/** Strona tylko dla firm: bez sesji przekierowanie do logowania z powrotem na `next`. */
export async function requireFirm(next = '/panel'): Promise<FirmSession> {
  const session = await getFirmSession()
  if (!session) redirect(`/logowanie?next=${encodeURIComponent(next)}`)
  return session
}
