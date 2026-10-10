import type { Access, PayloadRequest } from 'payload'

import { hasActiveBan } from '@/lib/moderation/sanctions'

import { firmIdOf, isFirmUser } from '.'

export type CommunityScope = 'forum' | 'marketplace'

const ACTIVE_SUBSCRIPTIONS = new Set(['trial', 'active'])

/**
 * Członek społeczności (SPEC 2: „zweryfikowana, aktywna”): moduł włączony, e-mail potwierdzony,
 * NIP zweryfikowany, profil zatwierdzony, abonament `trial`/`active`, brak blokady w tym zakresie.
 * Wynik zapamiętany w `req.context`, bo Payload pyta o dostęp kilka razy w jednym żądaniu.
 */
export async function isCommunityMember(
  req: PayloadRequest,
  scope: CommunityScope,
): Promise<boolean> {
  const cacheKey = `community:${scope}`
  const cached = req.context[cacheKey]
  if (typeof cached === 'boolean') return cached
  const result = await checkMembership(req, scope)
  req.context[cacheKey] = result
  return result
}

async function checkMembership(req: PayloadRequest, scope: CommunityScope): Promise<boolean> {
  const { payload, user } = req
  const firmId = firmIdOf(user)
  if (
    !user ||
    !isFirmUser(user) ||
    !firmId ||
    (user as { _verified?: boolean | null })._verified === false
  )
    return false

  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (!settings.featureFlags?.[scope]) return false

  const firm = await payload.findByID({
    collection: 'firms',
    id: firmId,
    depth: 0,
    overrideAccess: true,
    req,
    disableErrors: true,
  })
  if (
    !firm ||
    firm.status !== 'active' ||
    !firm.registryVerifiedAt ||
    !ACTIVE_SUBSCRIPTIONS.has(firm.subscriptionStatus ?? '')
  ) {
    return false
  }

  return !(await hasActiveBan(payload, String(user.id), scope, req))
}

export const community =
  (scope: CommunityScope): Access =>
  ({ req }) =>
    isCommunityMember(req, scope)
