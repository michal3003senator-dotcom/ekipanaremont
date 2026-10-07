import { timingSafeEqual } from 'node:crypto'

import type { JobsConfig, PayloadRequest, TaskConfig } from 'payload'

import { isVerifiedStaff, nobody, staff } from '@/access'

/**
 * Zadania cykliczne (SPEC 5). Vercel Cron wywołuje `/api/payload-jobs/run?queue=…` z nagłówkiem
 * `Authorization: Bearer CRON_SECRET`; endpoint sam kolejkuje zadania z harmonogramem i je wykonuje.
 * Każde zadanie idempotentne, wynik w `output` (bez danych osobowych).
 */
export function isCronRequest(req: PayloadRequest, secret = process.env.CRON_SECRET): boolean {
  const header = req.headers.get('authorization') ?? ''
  if (!secret || secret.length < 32) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(header)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

const cronOrAdmin = ({ req }: { req: PayloadRequest }) =>
  isCronRequest(req) || isVerifiedStaff(req.user, 'admin')

/** Retencja leadów (SPEC 4: `retentionUntil`, global `settings.retention.leadsMonths`). */
const purgeExpiredLeads: TaskConfig<{ input: object; output: { deleted: number } }> = {
  slug: 'purgeExpiredLeads',
  label: 'Usuwanie leadów po okresie retencji',
  schedule: [{ cron: '0 15 2 * * *', queue: 'daily' }],
  retries: 2,
  handler: async ({ req }) => {
    const { docs } = await req.payload.delete({
      collection: 'leads',
      where: { retentionUntil: { less_than: new Date().toISOString() } },
      overrideAccess: true,
      req,
    })
    return { output: { deleted: docs.length } }
  },
}

export const jobs: JobsConfig = {
  access: { run: cronOrAdmin, queue: cronOrAdmin, cancel: cronOrAdmin },
  jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
    ...defaultJobsCollection,
    access: {
      ...defaultJobsCollection.access,
      read: staff('admin'),
      create: nobody,
      update: nobody,
      delete: staff('admin'),
    },
  }),
  tasks: [purgeExpiredLeads],
}
