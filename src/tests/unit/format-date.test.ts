import { describe, expect, it } from 'vitest'

import {
  addDays,
  daysBetween,
  formatLongDate,
  formatMonth,
  formatRelativeDays,
  formatShortDate,
  formatShortDateWithWeekday,
  formatWeekdayInitial,
  todayInWarsaw,
  weekdayIndex,
} from '../../lib/format/date'

describe('todayInWarsaw', () => {
  it('liczy dzień w strefie Europe/Warsaw, nie w UTC', () => {
    // 22:30 UTC w październiku to już 0:30 następnego dnia w Polsce (UTC+2).
    expect(todayInWarsaw(new Date('2026-10-06T22:30:00Z'))).toBe('2026-10-07')
    expect(todayInWarsaw(new Date('2026-10-06T21:30:00Z'))).toBe('2026-10-06')
    // Zimą UTC+1.
    expect(todayInWarsaw(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01')
  })
})

describe('arytmetyka dni', () => {
  it('nie gubi dnia przy zmianie czasu (25 października 2026)', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26')
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
  })

  it('liczy różnicę w obie strony', () => {
    expect(daysBetween('2026-10-07', '2026-10-14')).toBe(7)
    expect(daysBetween('2026-10-07', '2026-10-06')).toBe(-1)
  })

  it('numeruje dni tygodnia od poniedziałku', () => {
    expect(weekdayIndex('2026-10-12')).toBe(0)
    expect(weekdayIndex('2026-10-07')).toBe(2)
    expect(weekdayIndex('2026-10-11')).toBe(6)
  })

  it('odrzuca nieprawidłową datę', () => {
    // @ts-expect-error – test danych spoza typu
    expect(() => addDays('7.10.2026', 1)).toThrow(RangeError)
  })
})

describe('formaty polskie (DESIGN §8)', () => {
  it('formatuje daty', () => {
    expect(formatShortDate('2026-10-14')).toBe('14 paź')
    expect(formatShortDateWithWeekday('2026-10-14')).toBe('śr., 14 paź')
    expect(formatLongDate('2026-10-14')).toBe('środa, 14 października')
    expect(formatMonth('2026-09')).toBe('wrzesień 2026')
    expect(formatWeekdayInitial('2026-10-14')).toBe('Ś')
  })

  it('pisze dni względne jak w briefie', () => {
    expect(formatRelativeDays(-1)).toBe('wczoraj')
    expect(formatRelativeDays(0)).toBe('dziś')
    expect(formatRelativeDays(1)).toBe('jutro')
    expect(formatRelativeDays(-2)).toBe('2 dni temu')
    expect(formatRelativeDays(7)).toBe('za 7 dni')
  })
})
