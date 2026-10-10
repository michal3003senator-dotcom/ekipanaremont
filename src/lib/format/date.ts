/** Data kalendarzowa bez godziny, np. `2026-10-14` (termin, dzień potwierdzenia). */
export type CalendarDate = `${number}-${number}-${number}`
/** Miesiąc kalendarzowy, np. `2026-09` (miesiąc wykonania realizacji). */
export type CalendarMonth = `${number}-${number}`

const TIME_ZONE = 'Europe/Warsaw'
const DAY_MS = 86_400_000
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const isoInWarsaw = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// Daty kalendarzowe reprezentujemy jako północ UTC, więc formatujemy je w strefie UTC.
const formatters = {
  short: new Intl.DateTimeFormat('pl-PL', { timeZone: 'UTC', day: 'numeric', month: 'short' }),
  shortWithWeekday: new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }),
  long: new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
  month: new Intl.DateTimeFormat('pl-PL', { timeZone: 'UTC', month: 'long', year: 'numeric' }),
  weekdayNarrow: new Intl.DateTimeFormat('pl-PL', { timeZone: 'UTC', weekday: 'narrow' }),
}

const relative = new Intl.RelativeTimeFormat('pl', { numeric: 'always' })
const NEAR_DAYS = new Map([
  [-1, 'wczoraj'],
  [0, 'dziś'],
  [1, 'jutro'],
])

/** Dzisiejsza data w strefie Europe/Warsaw. */
export function todayInWarsaw(now: Date = new Date()): CalendarDate {
  return isoInWarsaw.format(now) as CalendarDate
}

/** Północ UTC danego dnia – arytmetyka dni bez wpływu zmiany czasu. */
function toUtc(date: CalendarDate): Date {
  const match = ISO_DATE.exec(date)
  if (!match) throw new RangeError(`Nieprawidłowa data kalendarzowa: ${date}`)
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return new Date(toUtc(date).getTime() + days * DAY_MS).toISOString().slice(0, 10) as CalendarDate
}

/** Liczba dni od `from` do `to`; ujemna, gdy `to` jest wcześniej. */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS)
}

/** Dzień tygodnia: 0 = poniedziałek … 6 = niedziela. */
export function weekdayIndex(date: CalendarDate): number {
  return (toUtc(date).getUTCDay() + 6) % 7
}

/** Data kalendarzowa jako lokalna północ – format oczekiwany przez kalendarz (react-day-picker). */
export function toLocalDate(date: CalendarDate): Date {
  const utc = toUtc(date)
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
}

/** Odwrotność `toLocalDate`. */
export function fromLocalDate(date: Date): CalendarDate {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` as CalendarDate
}

/** „14 paź” */
export const formatShortDate = (date: CalendarDate) => formatters.short.format(toUtc(date))

/** „śr., 14 paź” */
export const formatShortDateWithWeekday = (date: CalendarDate) =>
  formatters.shortWithWeekday.format(toUtc(date))

/** „pt 16 paź” – dzień tygodnia bez kropki, do kafla terminu i podpisów. */
export function formatDayAndDate(date: CalendarDate): string {
  const parts = formatters.shortWithWeekday.formatToParts(toUtc(date))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  return `${part('weekday').replace('.', '')} ${part('day')} ${part('month')}`
}

/** „środa, 14 października” – pełna forma dla czytników ekranu. */
export const formatLongDate = (date: CalendarDate) => formatters.long.format(toUtc(date))

/** „wrzesień 2026” */
export const formatMonth = (month: CalendarMonth) =>
  formatters.month.format(toUtc(`${month}-01` as CalendarDate))

/** Inicjał dnia tygodnia: „P”, „W”, „Ś”… */
export const formatWeekdayInitial = (date: CalendarDate) =>
  formatters.weekdayNarrow.format(toUtc(date)).toUpperCase()

/** „dziś”, „wczoraj”, „jutro”, „2 dni temu”, „za 7 dni” (DESIGN §8). */
export function formatRelativeDays(days: number): string {
  return NEAR_DAYS.get(days) ?? relative.format(days, 'day')
}

const instantDate = new Intl.DateTimeFormat('pl-PL', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Chwila z bazy (UTC) jako „14 października 2026” w strefie Europe/Warsaw. */
export const formatInstantDate = (iso: string | Date) => instantDate.format(new Date(iso))

/** Dzień kalendarzowy chwili w strefie Europe/Warsaw. */
export const calendarDateOf = (iso: string | Date) => todayInWarsaw(new Date(iso))
