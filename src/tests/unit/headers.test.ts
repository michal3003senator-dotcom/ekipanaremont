import { describe, expect, it } from 'vitest'

import { securityHeaders } from '../../lib/security/headers'

const asRecord = (indexable: boolean) =>
  Object.fromEntries(securityHeaders({ indexable }).map(({ key, value }) => [key, value]))

describe('securityHeaders', () => {
  const headers = asRecord(true)

  it('ustawia HSTS na 2 lata z subdomenami', () => {
    expect(headers['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains')
  })

  it('blokuje osadzanie i zgadywanie typu treści', () => {
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin')
  })

  it('w podglądzie redakcji dopuszcza ramkę tylko z tej samej domeny', () => {
    const preview = Object.fromEntries(
      securityHeaders({ indexable: true, framing: 'sameorigin' }).map(({ key, value }) => [
        key,
        value,
      ]),
    )
    expect(preview['X-Frame-Options']).toBe('SAMEORIGIN')
  })

  it('ogranicza referrer i uprawnienia przeglądarki', () => {
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['Permissions-Policy']).toContain('camera=()')
    expect(headers['Permissions-Policy']).toContain('geolocation=()')
  })

  it('wyłącza indeksowanie poza produkcją', () => {
    expect(asRecord(false)['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(headers['X-Robots-Tag']).toBeUndefined()
  })
})
