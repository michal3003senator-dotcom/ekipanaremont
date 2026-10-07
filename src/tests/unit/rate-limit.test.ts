import { beforeEach, describe, expect, it } from 'vitest'

import { LIMITS, rateLimit, resetMemoryLimits } from '../../lib/rate-limit'

describe('limity żądań (licznik w pamięci)', () => {
  beforeEach(resetMemoryLimits)

  it('blokuje po wyczerpaniu punktów i podaje czas do odblokowania', async () => {
    const now = Date.now()
    for (let i = 0; i < LIMITS.register.points; i += 1) {
      expect((await rateLimit('register', 'ip-1', now)).ok).toBe(true)
    }
    const blocked = await rateLimit('register', 'ip-1', now)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect((await rateLimit('register', 'ip-2', now)).ok).toBe(true)
  })

  it('odnawia punkty po upływie okna', async () => {
    const now = Date.now()
    for (let i = 0; i < LIMITS.verifyResend.points; i += 1)
      await rateLimit('verifyResend', 'k', now)
    expect((await rateLimit('verifyResend', 'k', now)).ok).toBe(false)
    expect(
      (await rateLimit('verifyResend', 'k', now + LIMITS.verifyResend.windowSeconds * 1000 + 1)).ok,
    ).toBe(true)
  })
})
