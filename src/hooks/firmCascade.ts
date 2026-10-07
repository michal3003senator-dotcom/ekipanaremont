import type { CollectionBeforeDeleteHook } from 'payload'

/** Treści należące do firmy – usuwane razem z nią (SPEC 3.4). Kolejność: najpierw rekordy, które
 * wskazują na inne (opinia → zapytanie, realizacja → zdjęcia). */
const OWNED = ['reviews', 'projects', 'inquiries', 'firmStatsDaily', 'listings', 'media'] as const

/**
 * Usunięcie firmy (przez administratora albo z konta firmy) zabiera jej realizacje, zdjęcia, opinie,
 * zapytania, statystyki i ogłoszenia – bez osieroconych rekordów. Konto firmy zostaje (bez profilu).
 */
export const deleteFirmContent: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const system = { overrideAccess: true, req } as const
  await req.payload.delete({
    collection: 'listingMessages',
    where: { fromFirm: { equals: id } },
    ...system,
  })
  for (const collection of OWNED)
    await req.payload.delete({ collection, where: { firm: { equals: id } }, ...system })
}
