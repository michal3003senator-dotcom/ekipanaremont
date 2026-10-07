import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isVerifiedStaff } from '@/access'
import type { FirmAccount, Staff } from '@/payload-types'

export type FirmSession = FirmAccount & { collection: 'firmAccounts' }

/** Użytkownik z ciasteczka sesji (konto firmy albo personel) albo `null`. */
async function sessionUser() {
  const payload = await getPayload({ config })
  // Payload odrzuca ciasteczko sesji przy `Sec-Fetch-Site: cross-site` (ochrona CSRF dla REST),
  // więc wejście z linku w poczcie wyglądałoby na wylogowanie. Tu to bezpieczne: strony tylko
  // czytają (odpowiedzi nie odczyta obca witryna), a Server Actions Next sprawdza po Origin.
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('sec-fetch-site', 'same-origin')
  requestHeaders.delete('origin')
  return (await payload.auth({ headers: requestHeaders })).user
}

/** Zalogowane konto firmy z ciasteczka sesji albo `null` (personel nie jest firmą). */
export async function getFirmSession(): Promise<FirmSession | null> {
  const user = await sessionUser()
  return user?.collection === 'firmAccounts' ? (user as FirmSession) : null
}

/** Redaktor lub administrator po kodzie 2FA – tylko on widzi szkice w podglądzie (ADR 0023). */
export async function getEditorialStaff(): Promise<(Staff & { collection: 'staff' }) | null> {
  const user = await sessionUser()
  return isVerifiedStaff(user, 'admin', 'editor') ? (user as Staff & { collection: 'staff' }) : null
}

/** Strona tylko dla firm: bez sesji przekierowanie do logowania z powrotem na `next`. */
export async function requireFirm(next = '/panel'): Promise<FirmSession> {
  const session = await getFirmSession()
  if (!session) redirect(`/logowanie?next=${encodeURIComponent(next)}`)
  return session
}
