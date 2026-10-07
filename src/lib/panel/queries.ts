import type { Payload } from 'payload'

/** Liczba zdjęć we wszystkich realizacjach firmy (warunek wysłania profilu, SPEC 3.3 pkt 5). */
export async function countPhotos(payload: Payload, firmId: string): Promise<number> {
  const { docs } = await payload.find({
    collection: 'projects',
    where: { firm: { equals: firmId } },
    select: { images: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return docs.reduce((sum, doc) => sum + (doc.images?.length ?? 0), 0)
}
