import type { PayloadRequest } from 'payload'

import { type EmailTemplate } from '@/emails/templates'
import { sendEmail, siteUrl } from '@/emails/send'
import { signLink, verifyLink } from '@/lib/auth/links'
import { decryptField, getKeyring, isEncrypted } from '@/lib/crypto'

import type { ReportDecision, ReportTarget } from './options'

const APPEAL_DAYS = 183
const DAY_MS = 24 * 60 * 60 * 1000

/** Link do odwołania od decyzji zapisanej w `reports` (ważny ~6 miesięcy, art. 20 DSA). */
export function appealUrl(reportId: string, now = new Date()): string {
  const token = signLink('appeal', reportId, new Date(now.getTime() + APPEAL_DAYS * DAY_MS))
  return siteUrl(`/odwolanie/${token}`)
}

/** ID decyzji z linku odwołania albo `null` (zły podpis, inny cel, po terminie). */
export const appealSubject = (token: string, now = new Date()) => verifyLink(token, 'appeal', now)

/** Wartość pola (S) prosto z hooka `afterChange` (tam jest jeszcze zaszyfrowana). */
export function plain(value: unknown, aad: string): string | null {
  if (typeof value !== 'string' || value === '') return null
  return isEncrypted(value) ? decryptField(value, aad, getKeyring()) : value
}

type DecisionInput = {
  targetType: ReportTarget
  targetId: string
  targetTitle?: string | null
  decision: ReportDecision
  reason: string
}

/**
 * Rejestr decyzji (SPEC 3.13): decyzja z urzędu zapisana jako rozpatrzone zgłoszenie z uzasadnieniem.
 * Autor zmiany (`req.user`) trafia do `decidedBy` i do auditLog przez hooki kolekcji.
 */
export async function recordDecision(req: PayloadRequest, input: DecisionInput): Promise<string> {
  const report = await req.payload.create({
    collection: 'reports',
    data: {
      targetType: input.targetType,
      targetId: input.targetId,
      targetTitle: input.targetTitle ?? undefined,
      reason: 'moderator',
      status: 'resolved',
      decision: input.decision,
      statementOfReasons: input.reason,
    },
    overrideAccess: true,
    req,
  })
  return report.id
}

/** E-mail do kont firmy (decyzje dotyczą treści firmy). Awaria poczty nie cofa decyzji. */
export async function emailFirmAccounts(
  req: PayloadRequest,
  firmId: string,
  template: EmailTemplate,
) {
  const { docs } = await req.payload.find({
    collection: 'firmAccounts',
    where: { firm: { equals: firmId } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  await safeSend(
    req,
    docs.map((account) => account.email),
    template,
  )
}

export async function safeSend(req: PayloadRequest, to: string[], template: EmailTemplate) {
  const results = await Promise.allSettled(
    to.map((address) => sendEmail(req.payload, address, template)),
  )
  if (results.some((result) => result.status === 'rejected'))
    req.payload.logger.error({ msg: 'Nie wysłano e-maila z decyzją moderacji' })
}
