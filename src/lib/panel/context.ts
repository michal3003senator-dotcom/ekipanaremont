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

/** Liczba zdjęć we wszystkich realizacjach firmy (warunek wysłania profilu). */
export async function countProjectPhotos(
  panel: Awaited<ReturnType<typeof getPanel>>,
): Promise<number> {
  if (!panel.firm) return 0
  const { docs } = await panel.payload.find({
    collection: 'projects',
    where: { firm: { equals: panel.firm.id } },
    select: { images: true },
    depth: 0,
    pagination: false,
    ...panel.as,
  })
  return docs.reduce((sum, doc) => sum + (doc.images?.length ?? 0), 0)
}
