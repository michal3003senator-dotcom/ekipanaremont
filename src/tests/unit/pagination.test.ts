import { describe, expect, it } from 'vitest'

import { paginationRange } from '../../lib/pagination'

describe('paginationRange', () => {
  it('pokazuje wszystkie strony, gdy jest ich mało', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('skraca środek wielokropkami', () => {
    expect(paginationRange(6, 20)).toEqual([1, 'gap', 5, 6, 7, 'gap', 20])
  })

  it('przy krawędziach pokazuje kilka sąsiednich stron', () => {
    expect(paginationRange(1, 20)).toEqual([1, 2, 3, 4, 'gap', 20])
    expect(paginationRange(20, 20)).toEqual([1, 'gap', 17, 18, 19, 20])
  })
})
