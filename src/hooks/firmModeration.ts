import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'

import { profileApproved, profileRejected } from '@/emails/templates'
import { sendEmail, siteUrl } from '@/emails/send'
import { formatInstantDate } from '@/lib/format/date'

const TRIAL_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Okres próbny startuje przy pierwszym zatwierdzeniu profilu (SPEC 3.3 pkt 7). */
export const startTrialOnApproval: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data.status !== 'active' || originalDoc?.status === 'active' || originalDoc?.trialStartsAt)
    return data
  const start = new Date()
  return {
    ...data,
    trialStartsAt: start.toISOString(),
    trialEndsAt: new Date(start.getTime() + TRIAL_DAYS * DAY_MS).toISOString(),
  }
}

/** E-mail do kont firmy po decyzji moderatora (SPEC 3.3 pkt 6). Awaria wysyłki nie cofa decyzji. */
export const notifyModerationDecision: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const decided =
    doc.status !== previousDoc?.status && (doc.status === 'active' || doc.status === 'rejected')
  if (!decided || previousDoc?.status !== 'pending_review') return doc
  const accounts = await req.payload.find({
    collection: 'firmAccounts',
    where: { firm: { equals: doc.id } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const template =
    doc.status === 'active'
      ? profileApproved(siteUrl('/panel/termin'), formatInstantDate(doc.trialEndsAt))
      : profileRejected(
          siteUrl('/panel/profil'),
          doc.moderationReason || 'Profil nie spełnia zasad serwisu.',
        )
  try {
    await Promise.all(
      accounts.docs.map((account) => sendEmail(req.payload, account.email, template)),
    )
  } catch {
    req.payload.logger.error({ msg: 'Nie wysłano e-maila z decyzją moderacji', firm: doc.id })
  }
  return doc
}
