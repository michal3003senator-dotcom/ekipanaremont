import { describe, expect, it } from 'vitest'

import { apiAuthVerdict, clientIp } from '../../lib/security/api-guard'

describe('logowanie REST', () => {
  it('konta firm: logowanie i reset hasła tylko przez formularze serwisu', () => {
    expect(apiAuthVerdict('POST', '/api/firmAccounts/login')).toBe('block')
    expect(apiAuthVerdict('POST', '/api/firmAccounts/forgot-password')).toBe('block')
    expect(apiAuthVerdict('POST', '/api/firmAccounts/verify/abc')).toBe('block')
    expect(apiAuthVerdict('POST', '/api/firmAccounts/logout')).toBe('pass')
    expect(apiAuthVerdict('GET', '/api/firmAccounts/me')).toBe('pass')
  })

  it('personel: logowanie przez panel z limitem na IP', () => {
    expect(apiAuthVerdict('POST', '/api/staff/login')).toBe('limit')
    expect(apiAuthVerdict('POST', '/api/staff/first-register')).toBe('limit')
    expect(apiAuthVerdict('PATCH', '/api/staff/123')).toBe('pass')
    expect(apiAuthVerdict('POST', '/api/staff/logout')).toBe('pass')
  })

  it('adres klienta z pierwszego wpisu x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }))).toBe(
      '203.0.113.5',
    )
    expect(clientIp(new Headers())).toBe('unknown')
  })
})
