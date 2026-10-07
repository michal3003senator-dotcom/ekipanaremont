import { afterEach, describe, expect, it, vi } from 'vitest'

import { isStrongPassword } from '../../lib/auth/password'
import { verifyTurnstile } from '../../lib/turnstile'
import { aboutStepSchema, nipSchema, registerSchema } from '../../lib/validation/forms'

describe('schematy formularzy', () => {
  it('rejestracja: e-mail małymi literami, hasło min. 12 znaków, zgoda wymagana', () => {
    const ok = registerSchema.safeParse({
      email: ' Jan@Firma.PL ',
      password: 'x'.repeat(12),
      terms: true,
    })
    expect(ok.success && ok.data.email).toBe('jan@firma.pl')
    expect(
      registerSchema.safeParse({ email: 'jan@firma.pl', password: 'krotkie', terms: true }).success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ email: 'jan@firma.pl', password: 'x'.repeat(12), terms: false })
        .success,
    ).toBe(false)
  })

  it('NIP bez myślników i z sumą kontrolną', () => {
    expect(nipSchema.parse({ nip: '526-025-02-74' }).nip).toBe('5260250274')
    expect(nipSchema.safeParse({ nip: '5260250275' }).success).toBe(false)
  })

  it('opis firmy: telefon i strona opcjonalne, ale poprawne', () => {
    const base = { shortDescription: 'Łazienki i kuchnie pod klucz w Łodzi.', vatInvoice: true }
    expect(aboutStepSchema.safeParse({ ...base, phone: '600 100 200', website: '' }).success).toBe(
      true,
    )
    expect(aboutStepSchema.safeParse({ ...base, website: 'http://firma.pl' }).success).toBe(false)
  })
})

describe('siła hasła', () => {
  it('odrzuca słowa ze słownika i przyjmuje długie, losowe frazy', () => {
    expect(isStrongPassword('haslohaslo12')).toBe(false)
    expect(isStrongPassword('Polska123456')).toBe(false)
    expect(isStrongPassword('kowalski1234', ['kowalski'])).toBe(false)
    expect(isStrongPassword('Fuga-Gres-Kielnia-48!')).toBe(true)
  })
})

describe('Turnstile', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('bez klucza przepuszcza poza produkcją, z kluczem pyta Cloudflare', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    expect(await verifyTurnstile(undefined)).toBe(true)
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'sekret')
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ success: false })),
    ) as unknown as typeof fetch
    expect(await verifyTurnstile('token', fetchMock)).toBe(false)
    expect(await verifyTurnstile(undefined, fetchMock)).toBe(false)
  })
})
