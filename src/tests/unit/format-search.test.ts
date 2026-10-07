import { describe, expect, it } from 'vitest'

import { filterByQuery, normalizeSearch } from '../../lib/format/search'

describe('normalizeSearch', () => {
  it('ignoruje wielkość liter i polskie znaki, także ł', () => {
    expect(normalizeSearch('Łódź')).toBe('lodz')
    expect(normalizeSearch('  Zgierz   Południe ')).toBe('zgierz poludnie')
    expect(normalizeSearch('ZAŻÓŁĆ GĘŚLĄ JAŹŃ')).toBe('zazolc gesla jazn')
  })
})

describe('filterByQuery', () => {
  const places = ['Konstantynów Łódzki', 'Łódź', 'Głowno', 'Stryków']

  it('znajduje bez polskich znaków i stawia dopasowania od początku na górze', () => {
    expect(filterByQuery(places, 'lodz', (place) => place)).toEqual(['Łódź', 'Konstantynów Łódzki'])
  })

  it('pusta fraza zwraca wszystko', () => {
    expect(filterByQuery(places, ' ', (place) => place)).toEqual(places)
  })
})
