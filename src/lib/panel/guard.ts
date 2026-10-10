import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { idOf } from '@/access'
import { tooManyRequests } from '@/lib/actions'
import { getFirmSession, type FirmSession } from '@/lib/auth/session'
import { hasActiveBan } from '@/lib/moderation/sanctions'
import { rateLimit } from '@/lib/rate-limit'

export type ActionContext = {
  session: FirmSession
  payload: Payload
  firmId: string | null
  /** Opcje Local API „jako ta firma” – reguły dostępu kolekcji i pól obowiązują. */
  as: { overrideAccess: false; user: FirmSession }
}

/**
 * Wspólny początek każdej akcji panelu: sesja firmy (bez niej – błąd, nie przekierowanie,
 * bo akcja jest publicznym endpointem) i limit żądań na konto.
 */
/**
 * `allowBanned` – eksport i usunięcie danych (RODO art. 15, 17, 20) działają także przy blokadzie.
 */
export async function actionContext({ allowBanned = false } = {}): Promise<
  ActionContext | { error: ReturnType<typeof tooManyRequests> | { ok: false; message: string } }
> {
  const session = await getFirmSession()
  if (!session) return { error: { ok: false, message: 'Sesja wygasła. Zaloguj się ponownie.' } }
  const limit = await rateLimit('panelAction', session.id)
  if (!limit.ok) return { error: tooManyRequests(limit.retryAfterSeconds) }
  const payload = await getPayload({ config })
  // Blokada całego konta (SPEC 3.11) zamyka także zapis – nie tylko strony panelu.
  if (!allowBanned && (await hasActiveBan(payload, session.id, 'account')))
    return {
      error: { ok: false, message: 'Konto jest zablokowane. Szczegóły w e-mailu od moderatora.' },
    }
  return {
    session,
    payload,
    firmId: idOf(session.firm),
    as: { overrideAccess: false, user: session },
  }
}

/** Sprawdzenie hasła przed operacją nieodwracalną (eksport, usunięcie, zmiana e-maila). */
export async function verifyPassword(
  payload: Payload,
  email: string,
  password: string,
): Promise<boolean> {
  try {
    await payload.login({ collection: 'firmAccounts', data: { email, password } })
    return true
  } catch {
    return false
  }
}
