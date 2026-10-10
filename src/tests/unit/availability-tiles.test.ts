import { describe, expect, it } from 'vitest'

import {
  availabilityDescription,
  availabilityLabel,
  availabilitySummary,
  buildTiles,
  confirmedLabel,
  getAvailability,
  revealStaggerMs,
  TILE_COUNT,
} from '../../components/features/availability-tiles/model'

const TODAY = '2026-10-07' // środa

const kinds = (availableFrom: Parameters<typeof getAvailability>[1]) =>
  buildTiles(TODAY, getAvailability(TODAY, availableFrom)).map((tile) => tile.kind)

describe('getAvailability', () => {
  it('rozpoznaje termin w pasku, poza nim i jego brak', () => {
    expect(getAvailability(TODAY, null)).toEqual({ status: 'none' })
    expect(getAvailability(TODAY, '2026-10-07')).toMatchObject({ status: 'soon', offset: 0 })
    expect(getAvailability(TODAY, '2026-10-20')).toMatchObject({ status: 'soon', offset: 13 })
    expect(getAvailability(TODAY, '2026-10-21')).toMatchObject({ status: 'later', offset: 14 })
  })

  it('termin z przeszłości jest nieaktywny (SPEC 3.5)', () => {
    expect(getAvailability(TODAY, '2026-10-06')).toEqual({ status: 'none' })
  })
})

describe('buildTiles', () => {
  it('pokazuje 14 dni: zajęte do terminu, wolny, potem puste', () => {
    const tiles = kinds('2026-10-14')
    expect(tiles).toHaveLength(TILE_COUNT)
    expect(tiles.slice(0, 7)).toEqual(Array(7).fill('taken'))
    expect(tiles[7]).toBe('free')
    expect(tiles.slice(8)).toEqual(Array(6).fill('open'))
  })

  it('termin dalej niż 14 dni: ostatni kafel jest strzałką', () => {
    const tiles = kinds('2026-11-03')
    expect(tiles.slice(0, 13)).toEqual(Array(13).fill('taken'))
    expect(tiles[13]).toBe('beyond')
  })

  it('bez terminu wszystkie kafle są wygaszone', () => {
    expect(kinds(null)).toEqual(Array(TILE_COUNT).fill('off'))
  })

  it('zaznacza szerszą fugę przed każdym poniedziałkiem poza pierwszym kaflem', () => {
    const tiles = buildTiles(TODAY, { status: 'none' })
    const mondays = tiles.flatMap((tile, index) => (tile.weekStart ? [index] : []))
    expect(mondays).toEqual([5, 12])
    expect(buildTiles('2026-10-12', { status: 'none' })[0]?.weekStart).toBe(false)
  })

  it('animacja kończy się na wolnym kaflu i mieści w ok. 400 ms', () => {
    const availability = getAvailability(TODAY, '2026-10-14')
    const steps = buildTiles(TODAY, availability).map((tile) => tile.revealStep)
    expect(Math.max(...steps)).toBe(7)
    expect(revealStaggerMs(availability) * 7).toBeLessThanOrEqual(200)
  })
})

describe('podpisy', () => {
  it('opisuje termin krótko', () => {
    expect(availabilityLabel(getAvailability(TODAY, '2026-10-07'))).toBe('Wolny od dziś')
    expect(availabilityLabel(getAvailability(TODAY, '2026-10-08'))).toBe('Wolny od jutra')
    expect(availabilityLabel(getAvailability(TODAY, '2026-10-14'))).toBe('Wolny od śr 14 paź')
    expect(availabilityLabel(getAvailability(TODAY, '2026-11-03'))).toBe('Wolny od wt 3 lis')
    expect(availabilityLabel(getAvailability(TODAY, null))).toBe('Termin do uzgodnienia')
  })

  it('nagłówek kafla: data z dniem tygodnia i odstęp od dziś', () => {
    expect(availabilitySummary(getAvailability(TODAY, '2026-10-14'))).toEqual({
      date: 'śr 14 paź',
      distance: 'za 7 dni',
    })
    expect(availabilitySummary(getAvailability(TODAY, '2026-10-07')).distance).toBe('dziś')
    expect(availabilitySummary(getAvailability(TODAY, null))).toEqual({
      date: 'do uzgodnienia',
      distance: null,
    })
  })

  it('opisuje potwierdzenie względem dziś', () => {
    expect(confirmedLabel(TODAY, '2026-10-06')).toBe('potwierdzony wczoraj')
    expect(confirmedLabel(TODAY, '2026-10-04')).toBe('potwierdzony 3 dni temu')
  })

  it('daje pełne zdanie dla czytników ekranu', () => {
    expect(availabilityDescription(TODAY, getAvailability(TODAY, '2026-10-14'), '2026-10-06')).toBe(
      'Najbliższy wolny termin: środa, 14 października, za 7 dni. Potwierdzony wczoraj.',
    )
    expect(availabilityDescription(TODAY, getAvailability(TODAY, null))).toBe(
      'Najbliższy wolny termin: do uzgodnienia – firma nie podała daty.',
    )
  })
})
