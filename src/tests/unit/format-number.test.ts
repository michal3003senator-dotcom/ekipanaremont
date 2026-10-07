import { describe, expect, it } from 'vitest'

import { formatCount, formatPrice, formatRating } from '../../lib/format/number'

const NBSP = ' '

describe('formatPrice', () => {
  it('grupuje także liczby czterocyfrowe: „1 250 zł”', () => {
    expect(formatPrice(125_000)).toBe(`1${NBSP}250${NBSP}zł`)
  })

  it('pokazuje grosze tylko, gdy są', () => {
    expect(formatPrice(125_050)).toBe(`1${NBSP}250,50${NBSP}zł`)
    expect(formatPrice(9_900)).toBe(`99${NBSP}zł`)
  })

  it('przyjmuje tylko całkowitą liczbę groszy', () => {
    expect(() => formatPrice(12.5)).toThrow(RangeError)
  })
})

describe('liczby i odmiana', () => {
  it('formatuje ocenę z przecinkiem', () => {
    expect(formatRating(4.9)).toBe('4,9')
    expect(formatRating(5)).toBe('5,0')
  })

  it('odmienia rzeczownik po liczbie', () => {
    const forms = { one: 'opinia', few: 'opinie', many: 'opinii' }
    expect(formatCount(1, forms)).toBe('1 opinia')
    expect(formatCount(2, forms)).toBe('2 opinie')
    expect(formatCount(5, forms)).toBe('5 opinii')
    expect(formatCount(12, forms)).toBe('12 opinii')
    expect(formatCount(22, forms)).toBe('22 opinie')
  })
})
