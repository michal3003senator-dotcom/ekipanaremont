import { describe, expect, it } from 'vitest'

import { signLink, verifyLink } from '../../lib/auth/links'

const env = { LINK_SIGNING_KEY: Buffer.alloc(32, 7).toString('base64') }
const NOW = new Date('2026-10-07T10:00:00Z')
const LATER = new Date('2026-10-08T10:00:00Z')

describe('podpisane linki', () => {
  it('zwraca podmiot dla poprawnego, ważnego linku', () => {
    const token = signLink('confirm-availability', 'firma-1', LATER, env)
    expect(verifyLink(token, 'confirm-availability', NOW, env)).toBe('firma-1')
  })

  it('odrzuca link po terminie, z innym celem albo zmienioną treścią', () => {
    const token = signLink('confirm-availability', 'firma-1', LATER, env)
    expect(
      verifyLink(token, 'confirm-availability', new Date('2026-10-09T00:00:00Z'), env),
    ).toBeNull()
    const [body, signature] = token.split('.')
    const forged = Buffer.from(
      JSON.stringify({ p: 'confirm-availability', s: 'firma-2', e: 9e9 }),
    ).toString('base64url')
    expect(verifyLink(`${forged}.${signature}`, 'confirm-availability', NOW, env)).toBeNull()
    expect(verifyLink(`${body}.x${signature}`, 'confirm-availability', NOW, env)).toBeNull()
    expect(verifyLink('śmieci', 'confirm-availability', NOW, env)).toBeNull()
  })

  it('link podpisany innym kluczem nie przechodzi', () => {
    const token = signLink('confirm-availability', 'firma-1', LATER, {
      LINK_SIGNING_KEY: Buffer.alloc(32, 8).toString('base64'),
    })
    expect(verifyLink(token, 'confirm-availability', NOW, env)).toBeNull()
  })
})
