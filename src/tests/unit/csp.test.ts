import { describe, expect, it } from 'vitest'

import { buildCsp, createNonce } from '../../lib/security/csp'

const directive = (csp: string, name: string) =>
  csp.split('; ').find((entry) => entry.startsWith(`${name} `))

describe('buildCsp', () => {
  const production = buildCsp({ nonce: 'abc123', isDev: false, upgradeInsecureRequests: true })

  it('dopuszcza skrypty tylko z nonce i strict-dynamic', () => {
    expect(directive(production, 'script-src')).toBe(
      "script-src 'self' 'nonce-abc123' 'strict-dynamic'",
    )
  })

  it('blokuje osadzanie, wtyczki i zmianę base URI', () => {
    expect(directive(production, 'frame-ancestors')).toBe("frame-ancestors 'none'")
    expect(directive(production, 'object-src')).toBe("object-src 'none'")
    expect(directive(production, 'base-uri')).toBe("base-uri 'self'")
    expect(directive(production, 'form-action')).toBe("form-action 'self'")
  })

  it('ramka tylko w podglądzie redakcji (ADR 0023), panel osadza tylko własne strony', () => {
    const preview = buildCsp({
      nonce: 'abc123',
      isDev: false,
      upgradeInsecureRequests: true,
      previewFraming: true,
    })
    expect(directive(preview, 'frame-ancestors')).toBe("frame-ancestors 'self'")
    expect(directive(production, 'frame-src')).toBe('frame-src https://challenges.cloudflare.com')
    const adminPanel = buildCsp({
      nonce: 'abc123',
      isDev: false,
      upgradeInsecureRequests: true,
      framesSelf: true,
    })
    expect(directive(adminPanel, 'frame-src')).toBe(
      "frame-src 'self' https://challenges.cloudflare.com",
    )
    expect(directive(adminPanel, 'frame-ancestors')).toBe("frame-ancestors 'none'")
  })

  it("dodaje 'unsafe-eval' tylko w trybie deweloperskim", () => {
    const dev = buildCsp({ nonce: 'abc123', isDev: true, upgradeInsecureRequests: false })
    expect(directive(dev, 'script-src')).toContain("'unsafe-eval'")
    expect(production).not.toContain("'unsafe-eval'")
  })

  it('nigdy nie dopuszcza skryptów inline bez nonce', () => {
    expect(directive(production, 'script-src')).not.toContain("'unsafe-inline'")
  })

  it('wymusza HTTPS tylko przy połączeniu HTTPS', () => {
    expect(production).toContain('upgrade-insecure-requests')
    const local = buildCsp({ nonce: 'abc123', isDev: false, upgradeInsecureRequests: false })
    expect(local).not.toContain('upgrade-insecure-requests')
  })
})

describe('createNonce', () => {
  it('zwraca 128 losowych bitów w base64, za każdym razem inne', () => {
    const nonces = new Set(Array.from({ length: 100 }, () => createNonce()))
    expect(nonces.size).toBe(100)
    for (const nonce of nonces) expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/)
  })
})
