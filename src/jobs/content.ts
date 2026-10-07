import type { TaskConfig } from 'payload'

/** Najwyżej tyle publikacji w jednym przebiegu – reszta w następnym. */
const BATCH = 50

/**
 * Harmonogram publikacji artykułów (ADR 0022): szkic z `publishAt` w przeszłości dostaje
 * status „opublikowany” z treścią najnowszego szkicu. Działa jako system – zadanie Payload
 * `schedulePublish` uruchamia się jako redaktor bez 2FA i reguły dostępu by je odrzuciły.
 */
export const publishScheduled: TaskConfig<{ input: object; output: { published: number } }> = {
  slug: 'publishScheduled',
  label: 'Publikacja zaplanowanych artykułów',
  schedule: [{ cron: '0 5 * * * *', queue: 'hourly' }],
  retries: 2,
  handler: async ({ req }) => {
    const { docs } = await req.payload.find({
      collection: 'articles',
      where: {
        _status: { equals: 'draft' },
        publishAt: { less_than_equal: new Date().toISOString() },
      },
      draft: true,
      depth: 0,
      limit: BATCH,
      overrideAccess: true,
      req,
    })
    let published = 0
    for (const draft of docs) {
      const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = draft
      await req.payload.update({
        collection: 'articles',
        id,
        data: { ...data, _status: 'published', publishAt: null },
        overrideAccess: true,
        req,
      })
      published += 1
    }
    return { output: { published } }
  },
}
