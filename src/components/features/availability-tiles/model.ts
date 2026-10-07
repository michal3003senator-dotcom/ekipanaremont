import {
  addDays,
  type CalendarDate,
  daysBetween,
  formatLongDate,
  formatRelativeDays,
  formatShortDate,
  weekdayIndex,
} from '../../../lib/format/date'

/** Pasek pokazuje najbliższe 2 tygodnie, licząc od dziś (DESIGN §2). */
export const TILE_COUNT = 14
/** Rozłożenie startów kafli; z przejściem (150 ms) i opóźnieniem fioletu (50 ms) daje ok. 400 ms (DESIGN §2). */
const REVEAL_SPREAD_MS = 200

export type Availability =
  | { status: 'none' }
  | { status: 'soon'; date: CalendarDate; offset: number }
  | { status: 'later'; date: CalendarDate; offset: number }

/** taken – dzień przed terminem, free – wolny termin, open – dalsze dni, beyond – termin poza paskiem, off – brak terminu. */
export type TileKind = 'taken' | 'free' | 'open' | 'beyond' | 'off'

export type Tile = {
  date: CalendarDate
  kind: TileKind
  /** Poniedziałek (poza pierwszym kaflem): szersza fuga między tygodniami. */
  weekStart: boolean
  /** Kolejność zapalania w animacji. */
  revealStep: number
}

/** Termin w przeszłości jest nieaktywny (SPEC 3.5). Wygaśnięcie po `expiryDays` liczy wywołujący. */
export function getAvailability(
  today: CalendarDate,
  availableFrom: CalendarDate | null,
): Availability {
  if (!availableFrom) return { status: 'none' }
  const offset = daysBetween(today, availableFrom)
  if (offset < 0) return { status: 'none' }
  return { status: offset < TILE_COUNT ? 'soon' : 'later', date: availableFrom, offset }
}

/** Kafel, na którym kończy się animacja: wolny termin albo strzałka. */
function lastRevealIndex(availability: Availability): number {
  return availability.status === 'soon' ? availability.offset : TILE_COUNT - 1
}

function tileKind(index: number, availability: Availability): TileKind {
  switch (availability.status) {
    case 'none':
      return 'off'
    case 'later':
      return index === TILE_COUNT - 1 ? 'beyond' : 'taken'
    case 'soon':
      if (index < availability.offset) return 'taken'
      return index === availability.offset ? 'free' : 'open'
  }
}

export function buildTiles(today: CalendarDate, availability: Availability): Tile[] {
  const last = lastRevealIndex(availability)
  return Array.from({ length: TILE_COUNT }, (_, index) => {
    const date = addDays(today, index)
    return {
      date,
      kind: tileKind(index, availability),
      weekStart: index > 0 && weekdayIndex(date) === 0,
      revealStep: Math.min(index, last),
    }
  })
}

/** Odstęp między zapalaniem kolejnych kafli, tak by cały pasek zmieścił się w ok. 400 ms. */
export function revealStaggerMs(availability: Availability): number {
  return Math.round(REVEAL_SPREAD_MS / Math.max(lastRevealIndex(availability), 1))
}

/** „od dziś”, „od jutra”, „od 14 paź”; null, gdy nie ma terminu. */
export function availabilityFrom(availability: Availability): string | null {
  if (availability.status === 'none') return null
  if (availability.offset === 0) return 'od dziś'
  if (availability.offset === 1) return 'od jutra'
  return `od ${formatShortDate(availability.date)}`
}

/** Podpis pod paskiem: „Wolny od 14 paź”, „Wolny od dziś”, „Zapytaj o termin”. */
export function availabilityLabel(availability: Availability): string {
  const from = availabilityFrom(availability)
  return from ? `Wolny ${from}` : 'Zapytaj o termin'
}

/** „potwierdzony wczoraj”, „potwierdzony 3 dni temu”. */
export function confirmedLabel(today: CalendarDate, confirmedOn: CalendarDate): string {
  return `potwierdzony ${formatRelativeDays(daysBetween(today, confirmedOn))}`
}

/** Pełne zdanie dla czytników ekranu – kafle są dla nich niewidoczne. */
export function availabilityDescription(
  today: CalendarDate,
  availability: Availability,
  confirmedOn?: CalendarDate,
): string {
  if (availability.status === 'none') return 'Brak potwierdzonego terminu. Zapytaj o termin.'
  const when = `${formatLongDate(availability.date)}, ${formatRelativeDays(availability.offset)}`
  const confirmed = confirmedOn ? ` ${capitalize(confirmedLabel(today, confirmedOn))}.` : ''
  return `Najbliższy wolny termin: ${when}.${confirmed}`
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
