import { z } from 'zod'

import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-rules'

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
