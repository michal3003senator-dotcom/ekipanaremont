import type { PayloadRequest, TaskConfig } from 'payload'

import { moderationDigest } from '@/emails/templates'
import { siteUrl } from '@/emails/send'
import { safeSend } from '@/lib/moderation/decisions'
import { pendingCounts } from '@/lib/moderation/queue'

type Output = { input: object; output: { sent: number } }
const HOUR_MS = 60 * 60 * 1000

async function moderatorEmails(req: PayloadRequest) {
  const { docs } = await req.payload.find({
    collection: 'staff',
    where: { role: { in: ['admin', 'moderator'] } },
    select: { email: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  return docs.map((member) => member.email)
}

async function sendDigest(req: PayloadRequest) {
  const counts = await pendingCounts(req.payload)
  if (counts.firms + counts.reviews + counts.reports === 0) return 0
  const to = await moderatorEmails(req)
  await safeSend(req, to, moderationDigest(counts, siteUrl('/moderacja')))
  return to.length
}

/** Co godzinę (SPEC 5): podsumowanie tylko wtedy, gdy w tej godzinie wpłynęły nowe zgłoszenia. */
export const moderationAlert: TaskConfig<Output> = {
  slug: 'moderationAlert',
  label: 'Nowe zgłoszenia – powiadomienie moderatorów',
  schedule: [{ cron: '0 5 * * * *', queue: 'hourly' }],
  retries: 1,
  handler: async ({ req }) => {
    const fresh = await req.payload.count({
      collection: 'reports',
      where: {
        status: { equals: 'new' },
        createdAt: { greater_than: new Date(Date.now() - HOUR_MS).toISOString() },
      },
      overrideAccess: true,
      req,
    })
    return { output: { sent: fresh.totalDocs ? await sendDigest(req) : 0 } }
  },
}

/** Codziennie rano (SPEC 3.11): co czeka na moderację. */
export const moderationDailyDigest: TaskConfig<Output> = {
  slug: 'moderationDailyDigest',
  label: 'Codzienne podsumowanie moderacji',
  schedule: [{ cron: '0 15 2 * * *', queue: 'daily' }],
  retries: 1,
  handler: async ({ req }) => ({ output: { sent: await sendDigest(req) } }),
}
