import type { CollectionBeforeChangeHook } from 'payload'

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
