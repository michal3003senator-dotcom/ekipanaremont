import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { idOf } from '@/access'

/** Średnia i liczba zatwierdzonych opinii zapisane w firmie (sortowanie i karty bez dodatkowych zapytań). */
async function syncFirmRating(firmId: string | null, req: PayloadRequest) {
  if (!firmId) return
  const { docs } = await req.payload.find({
    collection: 'reviews',
    where: { firm: { equals: firmId }, status: { equals: 'approved' } },
    select: { rating: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const ratingCount = docs.length
  const ratingAvg = ratingCount
    ? Math.round((docs.reduce((sum, doc) => sum + doc.rating, 0) / ratingCount) * 10) / 10
    : null
  await req.payload.update({
    collection: 'firms',
    id: firmId,
    data: { ratingAvg, ratingCount },
    overrideAccess: true,
    req,
    context: { skipAudit: true },
  })
}

export const syncRatingAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (doc.status !== previousDoc?.status || doc.rating !== previousDoc?.rating)
    await syncFirmRating(idOf(doc.firm), req)
  return doc
}

export const syncRatingAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await syncFirmRating(idOf(doc.firm), req)
  return doc
}
