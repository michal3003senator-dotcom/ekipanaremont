import { describe, expect, it } from 'vitest'

import { checkCalculatorParams } from '../../lib/calculators/params'
import { checkAvailabilityDate, isValidNip, PHONE_PL, slugify } from '../../lib/validation'

const NOW = new Date('2026-10-07T10:00:00Z')

describe('walidacja', () => {
  it('NIP z sumą kontrolną', () => {
    expect(isValidNip('526-025-02-74')).toBe(true)
    expect(isValidNip('5260250275')).toBe(false)
  })

  it('wolny termin: dziś do +180 dni, niezmieniona data przechodzi', () => {
    expect(checkAvailabilityDate('2026-10-07', null, NOW)).toBe(true)
    expect(checkAvailabilityDate('2027-04-05', null, NOW)).toBe(true)
    expect(checkAvailabilityDate('2027-04-06', null, NOW)).toMatch(/180/)
    expect(checkAvailabilityDate('2026-10-06', null, NOW)).toMatch(/przeszłości/)
    expect(checkAvailabilityDate('2026-10-06', '2026-10-06', NOW)).toBe(true)
  })

  it('telefon i slug', () => {
    expect(PHONE_PL.test('+48 600 100 200')).toBe(true)
    expect(PHONE_PL.test('600 100 20')).toBe(false)
    expect(slugify('Zgierz – Łódź')).toBe('zgierz-lodz')
  })

  it('parametry kalkulatora według typu', () => {
    expect(checkCalculatorParams('tiles', { wastePercent: 10 })).toBe(true)
    expect(checkCalculatorParams('tiles', { wastePercent: 90 })).toMatch(/wastePercent/)
    expect(checkCalculatorParams('nieznany', {})).toMatch(/rodzaj/)
  })
})
