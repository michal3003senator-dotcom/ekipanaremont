'use server'

import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload, type Payload } from 'payload'

import { type ActionResult, invalid, tooManyRequests } from '@/lib/actions'
import { getModerator, type StaffSession } from '@/lib/auth/session'
import { rateLimit } from '@/lib/rate-limit'
import { decisionSchema, sanctionSchema } from '@/lib/validation/moderation'
import type { Report } from '@/payload-types'

/**
 * Akcje centrum moderacji (SPEC 3.11): tylko moderator lub administrator z 2FA, wejście przez Zod.
 * Zapis jako zalogowany członek personelu (auditLog, `decidedBy`); e-maile i rejestr decyzji
 * robią hooki kolekcji – tak samo jak przy zmianie w panelu Payload.
 */
const EXPIRED = 'Sesja wygasła. Zaloguj się w panelu z kodem 2FA i wróć tutaj.'
const DONE = 'Ktoś już to rozpatrzył – odświeżam kolejkę.'

type Ctx = { payload: Payload; moderator: StaffSession }

async function context(): Promise<Ctx | ActionResult<never>> {
  const moderator = await getModerator()
  if (!moderator) return { ok: false, message: EXPIRED }
  const limit = await rateLimit('panelAction', `staff:${moderator.id}`)
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds)
  return { payload: await getPayload({ config }), moderator }
}

const as = (moderator: StaffSession) =>
  ({ user: moderator, overrideAccess: true, depth: 0 }) as const

async function decideFirm(
  { payload, moderator }: Ctx,
  id: string,
  approve: boolean,
  reason: string,
): Promise<ActionResult> {
  const firm = await payload.findByID({
    collection: 'firms',
    id,
    ...as(moderator),
    disableErrors: true,
  })
  if (firm?.status !== 'pending_review') return { ok: false, message: DONE }
  await payload.update({
    collection: 'firms',
    id,
    data: approve
      ? { status: 'active', moderationReason: null }
      : { status: 'rejected', moderationReason: reason },
    ...as(moderator),
  })
  return { ok: true }
}

async function decideReview(
  { payload, moderator }: Ctx,
  id: string,
  approve: boolean,
  reason: string,
): Promise<ActionResult> {
  const review = await payload.findByID({
    collection: 'reviews',
    id,
    ...as(moderator),
    disableErrors: true,
  })
  if (review?.status !== 'pending') return { ok: false, message: DONE }
  await payload.update({
    collection: 'reviews',
    id,
    data: approve
      ? { status: 'approved', moderationReason: null }
      : { status: 'rejected', moderationReason: reason },
    ...as(moderator),
  })
  return { ok: true }
}

/** Ukrycie treści, której dotyczy zgłoszenie (uzasadnienie z decyzji trafia do autora). */
async function hideTarget({ payload, moderator }: Ctx, report: Report, reason: string) {
  const options = { ...as(moderator), context: { reportId: report.id } }
  const id = report.targetId
  if (report.targetType === 'firms')
    await payload.update({
      collection: 'firms',
      id,
      data: { status: 'suspended', moderationReason: reason },
      ...options,
    })
  else if (report.targetType === 'reviews')
    await payload.update({
      collection: 'reviews',
      id,
      data: { status: 'rejected', moderationReason: reason },
      ...options,
    })
  else if (report.targetType === 'articles')
    await payload.update({ collection: 'articles', id, data: { _status: 'draft' }, ...options })
}

/** Uchylenie decyzji po odwołaniu: treść wraca (profil aktywny, opinia opublikowana). */
async function restoreTarget({ payload, moderator }: Ctx, report: Report) {
  const options = { ...as(moderator), context: { reportId: report.id } }
  const id = report.targetId
  if (report.targetType === 'firms') {
    const firm = await payload.findByID({
      collection: 'firms',
      id,
      ...options,
      disableErrors: true,
    })
    if (firm && (firm.status === 'suspended' || firm.status === 'rejected'))
      await payload.update({
        collection: 'firms',
        id,
        data: { status: 'active', moderationReason: null },
        ...options,
      })
  } else if (report.targetType === 'reviews') {
    await payload.update({
      collection: 'reviews',
      id,
      data: { status: 'approved', moderationReason: null },
      ...options,
    })
  } else if (report.targetType === 'articles') {
    await payload.update({ collection: 'articles', id, data: { _status: 'published' }, ...options })
  }
}

async function decideReport(
  ctx: Ctx,
  id: string,
  decision: 'dismiss' | 'hidden' | 'revert',
  reason: string,
): Promise<ActionResult> {
  const { payload, moderator } = ctx
  const report = await payload.findByID({
    collection: 'reports',
    id,
    ...as(moderator),
    disableErrors: true,
  })
  if (!report || (report.status !== 'new' && report.status !== 'in_review'))
    return { ok: false, message: DONE }
  const appeal = report.reason === 'appeal'
  if (decision === 'revert' && !appeal)
    return { ok: false, message: 'Uchylić można tylko decyzję, od której ktoś się odwołał.' }

  const resolved = decision !== 'dismiss'
  await payload.update({
    collection: 'reports',
    id,
    data: {
      status: resolved ? 'resolved' : 'rejected',
      decision: decision === 'hidden' ? 'hidden' : 'none',
      statementOfReasons: reason,
    },
    ...as(moderator),
  })
  if (decision === 'hidden') await hideTarget(ctx, report, reason)
  if (decision === 'revert') await restoreTarget(ctx, report)
  return { ok: true }
}

export async function decideAction(input: unknown): Promise<ActionResult> {
  const ctx = await context()
  if (!('payload' in ctx)) return ctx
  const parsed = decisionSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { kind, id, decision, reason } = parsed.data
  const result =
    kind === 'firm'
      ? await decideFirm(ctx, id, decision === 'approve', reason)
      : kind === 'review'
        ? await decideReview(ctx, id, decision === 'approve', reason)
        : await decideReport(ctx, id, decision, reason)
  revalidatePath('/moderacja')
  return result
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Ostrzeżenie albo blokada czasowa (forum, giełda, całe konto) z uzasadnieniem (SPEC 3.11). */
export async function sanctionAction(input: unknown): Promise<ActionResult> {
  const ctx = await context()
  if (!('payload' in ctx)) return ctx
  const parsed = sanctionSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { accountId, scope, type, days, reason, reportId } = parsed.data
  const { payload, moderator } = ctx

  const account = await payload.findByID({
    collection: 'firmAccounts',
    id: accountId,
    ...as(moderator),
    disableErrors: true,
  })
  if (!account) return { ok: false, message: 'Tego konta już nie ma.' }

  if (reportId) {
    const report = await payload.findByID({
      collection: 'reports',
      id: reportId,
      ...as(moderator),
      disableErrors: true,
    })
    if (!report) return { ok: false, message: DONE }
    if (report.status === 'new' || report.status === 'in_review')
      await payload.update({
        collection: 'reports',
        id: reportId,
        data: {
          status: 'resolved',
          decision: type === 'ban' ? 'banned' : 'warned',
          statementOfReasons: reason,
        },
        ...as(moderator),
      })
  }
  await payload.create({
    collection: 'sanctions',
    data: {
      account: accountId,
      scope,
      type,
      until: type === 'ban' && days ? new Date(Date.now() + days * DAY_MS).toISOString() : null,
      reason,
    },
    ...as(moderator),
    context: reportId ? { reportId } : {},
  })
  revalidatePath('/moderacja')
  return { ok: true }
}
