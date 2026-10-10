import type { Payload, PayloadRequest } from 'payload'

import type { SanctionScope } from './options'

/** Trwająca blokada konta w danym zakresie (blokada całego konta obejmuje każdy zakres). */
export async function hasActiveBan(
  payload: Payload,
  accountId: string,
  scope: SanctionScope,
  req?: PayloadRequest,
): Promise<boolean> {
  const bans = await payload.count({
    collection: 'sanctions',
    overrideAccess: true,
    req,
    where: {
      account: { equals: accountId },
      type: { equals: 'ban' },
      scope: { in: scope === 'account' ? ['account'] : [scope, 'account'] },
      or: [{ until: { exists: false } }, { until: { greater_than: new Date().toISOString() } }],
    },
  })
  return bans.totalDocs > 0
}
