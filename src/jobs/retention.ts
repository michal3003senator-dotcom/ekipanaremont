import type { TaskConfig } from 'payload'

import { idOf } from '@/access'

const BATCH = 200

/** Treść zastępcza pól wymaganych – rekord zostaje do statystyk firmy i powiązanej opinii. */
export const ANONYMIZED = {
  description: 'Dane usunięte po okresie przechowywania.',
  clientName: 'Usunięto',
  clientEmail: 'usunieto@anonim.invalid',
} as const

/** Granica retencji: rekordy starsze niż `months` miesięcy (UTC). */
export function retentionCutoff(months: number, now = new Date()): Date {
  const cutoff = new Date(now)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months)
  return cutoff
}

/**
 * Retencja zapytań (SPEC 4–5, `settings.retention.inquiriesMonths`): po okresie przechowywania
 * dane klienta, zdjęcia i skróty znikają; zostaje usługa, miejscowość, status i data.
 * Idempotentne (`anonymizedAt`), partiami – kolejne uruchomienie dokończy resztę.
 */
export const anonymizeInquiries: TaskConfig<{
  input: object
  output: { anonymized: number; photos: number }
}> = {
  slug: 'anonymizeInquiries',
  label: 'Anonimizacja zapytań po okresie retencji',
  schedule: [{ cron: '0 15 2 * * *', queue: 'daily' }],
  retries: 2,
  handler: async ({ req }) => {
    const system = { overrideAccess: true, depth: 0, req } as const
    const settings = await req.payload.findGlobal({ slug: 'settings', ...system })
    const cutoff = retentionCutoff(settings.retention?.inquiriesMonths ?? 24)
    const { docs } = await req.payload.find({
      collection: 'inquiries',
      where: {
        createdAt: { less_than: cutoff.toISOString() },
        anonymizedAt: { exists: false },
      },
      select: { images: true },
      limit: BATCH,
      ...system,
    })
    let photos = 0
    for (const inquiry of docs) {
      const images = (inquiry.images ?? []).map(idOf).filter((id): id is string => Boolean(id))
      if (images.length) {
        const deleted = await req.payload.delete({
          collection: 'media',
          where: { id: { in: images }, purpose: { equals: 'inquiry' } },
          ...system,
        })
        photos += deleted.docs.length
      }
      await req.payload.update({
        collection: 'inquiries',
        id: inquiry.id,
        data: {
          ...ANONYMIZED,
          clientPhone: null,
          clientEmailHash: null,
          ipHash: null,
          reviewTokenHash: null,
          images: [],
          anonymizedAt: new Date().toISOString(),
        },
        ...system,
      })
    }
    return { output: { anonymized: docs.length, photos } }
  },
}
