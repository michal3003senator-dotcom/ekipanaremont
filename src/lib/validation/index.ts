import { addDays, todayInWarsaw } from '@/lib/format/date'

/** NIP: 10 cyfr z poprawną sumą kontrolną (wagi 6,5,7,2,3,4,5,6,7). Myślniki i spacje są pomijane. */
export function isValidNip(value: string): boolean {
  const digits = value.replace(/[\s-]/g, '')
  if (!/^\d{10}$/.test(digits)) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const sum = weights.reduce((total, weight, index) => total + weight * Number(digits[index]), 0)
  return sum % 11 === Number(digits[9])
}

export const normalizeNip = (value: string) => value.replace(/[\s-]/g, '')

/** Data kalendarzowa `YYYY-MM-DD` (termin) i miesiąc `YYYY-MM` (realizacja). */
export const CALENDAR_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
export const CALENDAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

export { slugify } from './slug'

/** Trasy aplikacji w korzeniu adresu – nie mogą ich zająć ani usługi, ani strony z CMS (ADR 0022). */
export const ROUTE_SLUGS: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'artykuly',
  'design-lab',
  'firma',
  'forum',
  'gielda',
  'kalkulatory',
  'kierunki',
  'logowanie',
  'moderacja',
  'monitoring',
  'opengraph-image',
  'opinia',
  'panel',
  'potwierdz',
  'rejestracja',
  'reset-hasla',
  'robots',
  'sitemap',
  'styleguide',
  'szukaj',
  'termin',
  'zglos',
])

/** Strony z CMS podlinkowane w stopce – ich adresów nie zajmie usługa. */
export const CMS_PAGE_SLUGS: ReadonlySet<string> = new Set([
  'jak-sprawdzamy-opinie',
  'kontakt',
  'o-nas',
  'polityka-prywatnosci',
  'regulamin',
  'zasady-moderacji',
])

/** Slugi usług (strony lokalne /[usluga]/[miejscowosc]): bez tras aplikacji i stron z CMS (PLAN pyt. 11). */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([...ROUTE_SLUGS, ...CMS_PAGE_SLUGS])

import { AVAILABILITY_MAX_DAYS } from './limits'

export { AVAILABILITY_MAX_DAYS }

/**
 * Wolny termin: dziś do +180 dni (Europe/Warsaw). Niezmieniona data przechodzi, żeby po jej upływie
 * dało się zapisać resztę profilu (termin wygasa wtedy sam, SPEC 3.5).
 */
export function checkAvailabilityDate(
  value: unknown,
  previous: unknown,
  now = new Date(),
): true | string {
  if (value === null || value === undefined || value === '' || value === previous) return true
  if (typeof value !== 'string' || !CALENDAR_DATE.test(value))
    return 'Podaj datę w formacie RRRR-MM-DD.'
  const today = todayInWarsaw(now)
  if (value < today) return 'Termin nie może być w przeszłości.'
  if (value > addDays(today, AVAILABILITY_MAX_DAYS))
    return 'Termin może być najwyżej 180 dni od dziś.'
  return true
}

/** Telefon w Polsce: 9 cyfr, opcjonalnie +48, spacje i myślniki dozwolone. */
export const PHONE_PL = /^(?:\+48[\s-]?)?(?:\d[\s-]?){8}\d$/

/** Adres strony firmy: tylko https. */
export const HTTPS_URL = /^https:\/\/[^\s/$.?#][^\s]*$/i
