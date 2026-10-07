import config from '@payload-config'
import { getPayload } from 'payload'

import { idOf } from '@/access'
import { requireFirm } from '@/lib/auth/session'

/**
 * Kontekst stron panelu: sesja firmy, Payload i profil firmy (albo `null` przed kreatorem).
 * Odczyty idą z regułami dostępu (`overrideAccess: false`), jak każde żądanie firmy.
 */
export async function getPanel(next = '/panel') {
  const session = await requireFirm(next)
  const payload = await getPayload({ config })
  const firmId = idOf(session.firm)
  const firm = firmId
    ? await payload.findByID({
        collection: 'firms',
        id: firmId,
        depth: 1,
        overrideAccess: false,
        user: session,
        disableErrors: true,
      })
    : null
  return { session, payload, firm, as: { overrideAccess: false, user: session } as const }
}
