import { z } from 'zod'

import {
  PUBLIC_REASONS,
  PUBLIC_TARGETS,
  SANCTION_SCOPES,
  SANCTION_TYPES,
} from '@/lib/moderation/options'

import { email, id, optionalText } from './forms'

/** Schematy moderacji (SPEC 3.11, 3.13) – te same w formularzach i w Server Actions. */
const keys = <T extends Record<string, string>>(entries: T) =>
  Object.keys(entries) as [keyof T & string, ...(keyof T & string)[]]

const turnstileToken = z.string().max(4096).optional()

export const reportSchema = z.object({
  targetType: z.enum(PUBLIC_TARGETS),
  targetId: id,
  reason: z.enum(keys(PUBLIC_REASONS), 'Wybierz powód zgłoszenia.'),
  description: z
    .string()
    .trim()
    .min(10, 'Opisz krótko, co jest nie tak (co najmniej 10 znaków).')
    .max(2000, 'Najwyżej 2000 znaków.'),
  reporterName: optionalText(120),
  reporterEmail: email,
  goodFaith: z.literal(true, 'Potwierdź, że zgłoszenie składasz w dobrej wierze.'),
  turnstileToken,
})

export type ReportInput = z.input<typeof reportSchema>

export const appealSchema = z.object({
  token: z.string().min(10).max(1000),
  description: z
    .string()
    .trim()
    .min(20, 'Napisz, dlaczego decyzja jest błędna (co najmniej 20 znaków).')
    .max(3000, 'Najwyżej 3000 znaków.'),
  email,
  turnstileToken,
})

export type AppealInput = z.input<typeof appealSchema>

const reason = z.string().trim().max(5000, 'Najwyżej 5000 znaków.')

/**
 * Uzasadnienie (art. 16–17 DSA): przy każdej decyzji ograniczającej i każdej decyzji w sprawie
 * zgłoszenia (dostaje je zgłaszający). Zatwierdzenie profilu lub opinii – bez uzasadnienia.
 */
export const needsReason = (decision: string) => decision !== 'approve'

export const decisionSchema = z
  .discriminatedUnion('kind', [
    z.object({ kind: z.literal('firm'), id, decision: z.enum(['approve', 'reject']), reason }),
    z.object({ kind: z.literal('review'), id, decision: z.enum(['approve', 'reject']), reason }),
    z.object({
      kind: z.literal('report'),
      id,
      decision: z.enum(['dismiss', 'hidden', 'revert']),
      reason,
    }),
  ])
  .refine((input) => !needsReason(input.decision) || input.reason.length >= 10, {
    path: ['reason'],
    message: 'Uzasadnienie musi mieć co najmniej 10 znaków – trafi do autora.',
  })

export type DecisionInput = z.input<typeof decisionSchema>

export const sanctionSchema = z.object({
  accountId: id,
  scope: z.enum(keys(SANCTION_SCOPES)),
  type: z.enum(keys(SANCTION_TYPES)),
  /** Liczba dni blokady; `null` – bezterminowo. Ostrzeżenie bez czasu. */
  days: z.number().int().min(1).max(3650).nullable(),
  reason: reason.min(10, 'Uzasadnienie musi mieć co najmniej 10 znaków – trafi do firmy.'),
  reportId: id.optional(),
})

export type SanctionInput = z.input<typeof sanctionSchema>
