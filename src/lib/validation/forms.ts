import { z } from 'zod'

import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-rules'
import { BUDGET_RANGES, type BudgetRange, TIMEFRAMES, type Timeframe } from '@/lib/inquiry/options'

import { CALENDAR_DATE, CALENDAR_MONTH, HTTPS_URL, isValidNip, PHONE_PL } from '.'

/**
 * Schematy formularzy fazy 4 – te same w przeglądarce (React Hook Form) i w Server Actions.
 * Komunikaty konkretne, po polsku (DESIGN §8).
 */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Adres jest za długi.')
  .pipe(z.email('Podaj adres e-mail w formacie nazwa@domena.pl.'))

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.`)
  .max(128, 'Hasło może mieć najwyżej 128 znaków.')

const optionalText = (max: number) =>
  z.string().trim().max(max, `Najwyżej ${max} znaków.`).optional()
const optionalInt = (min: number, max: number) =>
  z.number().int(`Podaj liczbę całkowitą.`).min(min).max(max, `Najwyżej ${max}.`).optional()
const id = z.uuid('Nieprawidłowy identyfikator.')

export const registerSchema = z.object({
  email,
  password,
  terms: z.literal(true, 'Zaakceptuj regulamin i politykę prywatności.'),
  turnstileToken: z.string().max(4096).optional(),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Podaj hasło.').max(128),
  next: z.string().max(200).optional(),
})

export const forgotPasswordSchema = z.object({
  email,
  turnstileToken: z.string().max(4096).optional(),
})

export const resetPasswordSchema = z.object({ token: z.string().min(10).max(200), password })

export const nipSchema = z.object({
  nip: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine(isValidNip, 'Podaj poprawny NIP – 10 cyfr, sprawdzamy sumę kontrolną.'),
})

export const firmNameSchema = z.object({
  name: z.string().trim().min(2, 'Podaj nazwę firmy.').max(120, 'Najwyżej 120 znaków.'),
})

export const servicesStepSchema = z.object({
  services: z.array(id).min(1, 'Wybierz co najmniej jedną usługę.').max(15, 'Najwyżej 15 usług.'),
  // Siedziba dochodzi do obszaru na serwerze, więc lista może być pusta.
  serviceArea: z.array(id).max(60, 'Najwyżej 60 miejscowości.'),
  baseLocality: id,
})

export const aboutStepSchema = z.object({
  shortDescription: z
    .string()
    .trim()
    .min(20, 'Napisz co najmniej 20 znaków.')
    .max(300, 'Najwyżej 300 znaków.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PL.test(value), 'Podaj numer z 9 cyframi.')
    .optional(),
  website: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || HTTPS_URL.test(value),
      'Podaj adres zaczynający się od https://',
    )
    .optional(),
  vatInvoice: z.boolean(),
  warrantyMonths: optionalInt(0, 120),
  yearsExperience: optionalInt(0, 80),
  teamSize: optionalInt(1, 500),
})

export const availabilitySchema = z.object({
  date: z.string().regex(CALENDAR_DATE, 'Wybierz datę z kalendarza.'),
})

export const projectSchema = z.object({
  title: z.string().trim().min(3, 'Napisz krótki tytuł, np. „Łazienka 6 m² na Widzewie”.').max(120),
  service: id.optional(),
  locality: id.optional(),
  completedMonth: z.string().regex(CALENDAR_MONTH, 'Wybierz miesiąc.').optional(),
  description: optionalText(2000),
})

export const reorderSchema = z.object({ ids: z.array(id).max(30) })

export const inquiryStatusSchema = z.object({
  id,
  status: z.enum(['new', 'in_contact', 'closed', 'spam']),
})

export const reviewReplySchema = z.object({
  id,
  reply: z.string().trim().min(2, 'Napisz odpowiedź.').max(1500, 'Najwyżej 1500 znaków.'),
})

export const changePasswordSchema = z.object({
  current: z.string().min(1, 'Podaj obecne hasło.').max(128),
  next: password,
})

export const confirmWithPasswordSchema = z.object({
  password: z.string().min(1, 'Podaj hasło.').max(128),
})

export const notificationsSchema = z.object({
  inquiries: z.boolean(),
  availabilityReminders: z.boolean(),
  reviews: z.boolean(),
})

export type RegisterInput = z.input<typeof registerSchema>
export type LoginInput = z.input<typeof loginSchema>
export type AboutStepInput = z.input<typeof aboutStepSchema>
export type ProjectInput = z.input<typeof projectSchema>

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Nieprawidłowy adres.')
  .max(140)
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional())

/** Zapytanie do firmy (SPEC 3.6). Zdjęcia idą osobno w FormData i są sprawdzane w akcji. */
export const inquirySchema = z.object({
  firm: slug,
  service: optional(id),
  locality: z.string().min(1, 'Wybierz miejscowość z listy.').pipe(slug),
  description: z
    .string()
    .trim()
    .min(20, 'Opisz prace w co najmniej 20 znakach: co, gdzie, jaki metraż.')
    .max(2000, 'Najwyżej 2000 znaków.'),
  budgetRange: z.enum(
    Object.keys(BUDGET_RANGES) as [BudgetRange, ...BudgetRange[]],
    'Wybierz budżet.',
  ),
  timeframe: z.enum(Object.keys(TIMEFRAMES) as [Timeframe, ...Timeframe[]], 'Wybierz termin.'),
  clientName: z.string().trim().min(2, 'Podaj imię.').max(80, 'Najwyżej 80 znaków.'),
  clientEmail: email,
  clientPhone: optional(
    z.string().trim().regex(PHONE_PL, 'Podaj numer z 9 cyframi, np. 600 100 200.'),
  ),
  consent: z.literal(true, 'Zgoda jest potrzebna, żeby przekazać zapytanie firmie.'),
  turnstileToken: z.string().max(4096).optional(),
})

export type InquiryInput = z.input<typeof inquirySchema>

/** Opinia z jednorazowego linku (SPEC 3.7). */
export const reviewSchema = z.object({
  token: z.string().regex(/^[\w-]{20,64}$/, 'Link jest nieprawidłowy.'),
  rating: z
    .number('Wybierz ocenę od 1 do 5.')
    .int()
    .min(1, 'Wybierz ocenę od 1 do 5.')
    .max(5, 'Wybierz ocenę od 1 do 5.'),
  title: optionalText(120),
  body: z
    .string()
    .trim()
    .min(30, 'Napisz co najmniej 30 znaków: co firma zrobiła i jak przebiegła współpraca.')
    .max(1500, 'Najwyżej 1500 znaków.'),
  authorDisplayName: z
    .string()
    .trim()
    .regex(/^[^,]{2,40},\s*[^,]{2,40}$/, 'Podpisz się jak w przykładzie: „Anna, Widzew”.'),
})

export type ReviewInput = z.input<typeof reviewSchema>

/** Prośba o kontakt z kalkulatora (SPEC 3.8: lead z osobną zgodą). Wynik serwer liczy sam. */
export const leadSchema = z.object({
  calculatorId: id,
  inputs: z.record(z.string().max(20), z.number().min(0).max(10_000).nullable().optional()),
  name: z.string().trim().min(2, 'Podaj imię.').max(80, 'Najwyżej 80 znaków.'),
  email,
  phone: optional(z.string().trim().regex(PHONE_PL, 'Podaj numer z 9 cyframi, np. 600 100 200.')),
  consent: z.literal(true, 'Zgoda jest potrzebna, żebyśmy mogli się odezwać.'),
  turnstileToken: z.string().max(4096).optional(),
})

export type LeadInput = z.input<typeof leadSchema>
