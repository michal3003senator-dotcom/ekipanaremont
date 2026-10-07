import { buildTiles, getAvailability } from '@/components/features/availability-tiles/model'
import { addDays, formatShortDate, formatWeekdayInitial, weekdayIndex } from '@/lib/format/date'

import { DEMO_TODAY, FIRMS } from '../styleguide/_data'

const WEEKDAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd']

/** Dni grafiku: 14 dni od dziś. */
export const DAYS = Array.from({ length: 14 }, (_, index) => {
  const date = addDays(DEMO_TODAY, index)
  return {
    date,
    day: Number(date.slice(8)),
    initial: formatWeekdayInitial(date),
    weekday: WEEKDAYS[weekdayIndex(date)] ?? '',
    weekStart: index > 0 && weekdayIndex(date) === 0,
  }
})

/** Firmy z wierszem kafli i podpisem terminu – wspólne dla obu prób kierunku. */
export const ROWS = FIRMS.map((firm) => {
  const availability = getAvailability(DEMO_TODAY, firm.availableFrom)
  return {
    firm,
    tiles: buildTiles(DEMO_TODAY, availability),
    from:
      availability.status === 'none'
        ? null
        : availability.offset === 0
          ? 'dziś'
          : formatShortDate(availability.date),
  }
})
