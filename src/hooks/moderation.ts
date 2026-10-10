import {
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type PayloadRequest,
  ValidationError,
} from 'payload'

import { idOf } from '@/access'
import {
  moderationDecision,
  profileApproved,
  profileRejected,
  reportDecided,
} from '@/emails/templates'
import { siteUrl } from '@/emails/send'
import { formatInstantDate } from '@/lib/format/date'
import {
  appealUrl,
  emailFirmAccounts,
  plain,
  recordDecision,
  safeSend,
} from '@/lib/moderation/decisions'
import {
  REPORT_DECISIONS,
  REPORT_TARGETS,
  type ReportDecision,
  SANCTION_SCOPES,
  type SanctionScope,
} from '@/lib/moderation/options'

/**
 * Decyzje ograniczające (SPEC 3.11, 3.13, art. 17 DSA) – w centrum moderacji i w panelu Payload:
 * uzasadnienie obowiązkowe, wpis w rejestrze `reports`, e-mail do autora z linkiem do odwołania.
 * `context.reportId` – decyzja zapadła przy zgłoszeniu, więc jest już w rejestrze.
 */
const reportIdFrom = (context: Record<string, unknown>) =>
  typeof context.reportId === 'string' ? context.reportId : null

const requireReason = (collection: string, path: string, message: string) => {
  throw new ValidationError({ collection, errors: [{ path, message }] })
}

/** Uzasadnienie przy odrzuceniu lub ukryciu (zmiana statusu, nie tworzenie rekordu). */
export const requireModerationReason =
  (collection: 'firms' | 'reviews', restricted: readonly string[]): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc }) => {
    const status = data.status ?? originalDoc?.status
    const changed = operation === 'update' && status !== originalDoc?.status
    if (changed && restricted.includes(status) && !String(data.moderationReason ?? '').trim())
      requireReason(collection, 'moderationReason', 'Podaj uzasadnienie decyzji.')
    return data
  }

const DEFAULT_REASON = 'Treść narusza zasady serwisu.'

/** Firma: zatwierdzenie (e-mail), odrzucenie i zawieszenie (rejestr + e-mail z odwołaniem). */
export const firmDecisionNotices: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const from = previousDoc?.status
  const to = doc.status
  if (operation !== 'update' || from === to) return doc
  if (from === 'pending_review' && to === 'active') {
    await emailFirmAccounts(
      req,
      doc.id,
      profileApproved(siteUrl('/panel/termin'), formatInstantDate(doc.trialEndsAt)),
    )
    return doc
  }
  const rejected = to === 'rejected' && from === 'pending_review'
  if (!rejected && to !== 'suspended') return doc

  const reason = doc.moderationReason || DEFAULT_REASON
  const reportId =
    reportIdFrom(context) ??
    (await recordDecision(req, {
      targetType: 'firms',
      targetId: doc.id,
      targetTitle: doc.name,
      decision: 'hidden',
      reason,
    }))
  const appeal = appealUrl(reportId)
  await emailFirmAccounts(
    req,
    doc.id,
    rejected
      ? profileRejected(siteUrl('/panel/profil'), reason, appeal)
      : moderationDecision({
          what: `profil firmy ${doc.name}`,
          action: 'Profil firmy ukryty',
          reason,
          appealUrl: appeal,
        }),
  )
  return doc
}

/** Autor opinii to klient z zapytania – adres tylko do tej wiadomości (nie zapisujemy go w rejestrze). */
async function reviewAuthorEmail(req: PayloadRequest, inquiry: unknown) {
  const id = idOf(inquiry)
  if (!id) return null
  const found = await req.payload.findByID({
    collection: 'inquiries',
    id,
    depth: 0,
    select: { clientEmail: true },
    overrideAccess: true,
    disableErrors: true,
    req,
  })
  return found?.clientEmail ?? null
}

/** Opinia odrzucona lub zdjęta: rejestr + e-mail do autora z odwołaniem. */
export const reviewDecisionNotices: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (operation !== 'update' || doc.status !== 'rejected' || previousDoc?.status === 'rejected')
    return doc
  const reason = doc.moderationReason || DEFAULT_REASON
  const reportId =
    reportIdFrom(context) ??
    (await recordDecision(req, {
      targetType: 'reviews',
      targetId: doc.id,
      targetTitle: `opinia (${doc.rating}/5)`,
      decision: 'hidden',
      reason,
    }))
  const email = await reviewAuthorEmail(req, doc.inquiry)
  if (email)
    await safeSend(
      req,
      [email],
      moderationDecision({
        what: 'Twoja opinia o firmie',
        action: previousDoc?.status === 'approved' ? 'Opinia zdjęta' : 'Opinia nieopublikowana',
        reason,
        appealUrl: appealUrl(reportId),
      }),
    )
  return doc
}

/** Sankcja: rejestr (ostrzeżenie lub blokada) + e-mail do konta z odwołaniem. */
export const sanctionNotices: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  const accountId = idOf(doc.account)
  if (!accountId) return doc
  const account = await req.payload.findByID({
    collection: 'firmAccounts',
    id: accountId,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
    req,
  })
  if (!account) return doc
  const scope = SANCTION_SCOPES[doc.scope as SanctionScope]
  const ban = doc.type === 'ban'
  const reportId =
    reportIdFrom(context) ??
    (await recordDecision(req, {
      targetType: 'firms',
      targetId: idOf(account.firm) ?? accountId,
      targetTitle: `konto ${account.email}`,
      decision: ban ? 'banned' : 'warned',
      reason: doc.reason,
    }))
  const until = doc.until ? ` do ${formatInstantDate(doc.until)}` : ''
  await safeSend(
    req,
    [account.email],
    moderationDecision({
      what: `konto firmy – ${scope.toLowerCase()}`,
      action: ban ? `Blokada: ${scope.toLowerCase()}${until}` : 'Ostrzeżenie',
      reason: doc.reason,
      appealUrl: appealUrl(reportId),
    }),
  )
  return doc
}

/** Zgłoszenie: uzasadnienie przy decyzji (także odrzuceniu zgłoszenia). */
export const requireStatementOfReasons: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const status = data.status ?? originalDoc?.status
  const decided = status === 'resolved' || status === 'rejected'
  const reasons = data.statementOfReasons ?? originalDoc?.statementOfReasons
  if (decided && operation === 'update' && !String(reasons ?? '').trim())
    requireReason('reports', 'statementOfReasons', 'Podaj uzasadnienie decyzji.')
  return data
}

/** Zgłaszający (gość lub odwołujący się) dostaje decyzję z uzasadnieniem (art. 16 ust. 5 DSA). */
export const reportDecisionNotices: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const decided = doc.status === 'resolved' || doc.status === 'rejected'
  if (operation !== 'update' || !decided || previousDoc?.status === doc.status) return doc
  const email = plain(doc.reporterEmail, 'reports.reporterEmail')
  if (!email) return doc
  const what =
    doc.targetTitle || REPORT_TARGETS[doc.targetType as keyof typeof REPORT_TARGETS] || 'treść'
  const decision =
    doc.status === 'rejected'
      ? 'zgłoszenie odrzucone, treść bez zmian'
      : REPORT_DECISIONS[(doc.decision ?? 'none') as ReportDecision].toLowerCase()
  await safeSend(req, [email], reportDecided(what, decision, doc.statementOfReasons ?? ''))
  return doc
}
