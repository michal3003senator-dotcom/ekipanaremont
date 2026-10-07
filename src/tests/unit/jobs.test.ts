import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { isCronRequest } from '../../jobs'

const SECRET = 'x'.repeat(40)
const request = (authorization?: string) =>
  ({ headers: new Headers(authorization ? { authorization } : {}) }) as unknown as PayloadRequest

describe('isCronRequest', () => {
  it('przepuszcza tylko poprawny nagłówek Bearer', () => {
    expect(isCronRequest(request(`Bearer ${SECRET}`), SECRET)).toBe(true)
    expect(isCronRequest(request(`Bearer ${SECRET}x`), SECRET)).toBe(false)
    expect(isCronRequest(request(), SECRET)).toBe(false)
  })

  it('bez sekretu albo ze zbyt krótkim sekretem nie przepuszcza nikogo', () => {
    expect(isCronRequest(request('Bearer '), '')).toBe(false)
    expect(isCronRequest(request('Bearer krotki'), 'krotki')).toBe(false)
  })
})
