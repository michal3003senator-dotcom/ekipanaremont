import type { Payload } from 'payload'

export type LegalKind = 'terms' | 'privacy'

/** Rewizja tekstu zgody w kodzie – podbij przy każdej zmianie treści zgody w formularzu. */
const CONSENT_REVISION = { inquiry: 1, lead: 1 } as const

/**
 * Wersja opublikowanego dokumentu prawnego – jedno źródło: strona z `legalKind` (PLAN pyt. 12).
 * Bez opublikowanego dokumentu: „brak” (zapis zgody pokazuje, że regulaminu jeszcze nie było).
 */
export async function currentLegalVersion(payload: Payload, kind: LegalKind): Promise<string> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { legalKind: { equals: kind }, _status: { equals: 'published' } },
    select: { legalVersion: true },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0]?.legalVersion || 'brak'
}

/** Wersja zgody z formularza: rewizja tekstu zgody i wersja polityki prywatności, np. „zapytanie-1/pp-1.2”. */
export async function consentVersion(
  payload: Payload,
  form: keyof typeof CONSENT_REVISION,
): Promise<string> {
  const label = form === 'inquiry' ? 'zapytanie' : 'lead'
  return `${label}-${CONSENT_REVISION[form]}/pp-${await currentLegalVersion(payload, 'privacy')}`
}
