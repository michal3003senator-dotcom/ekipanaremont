import type { Payload } from 'payload'
import { getPayload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '../../payload.config'

// Server Actions poza Next: nagłówki, ciasteczka i przekierowania zastępujemy atrapami.
const jar = new Map<string, string>()
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}))
// Ciasteczko sesji ustawia `@payloadcms/next` (zależność spoza Vitest) – tu tylko logowanie Local API.
vi.mock('@payloadcms/next/auth', async () => {
  const { getPayload: load } = await import('payload')
  const { default: cfg } = await import('../../payload.config')
  return {
    login: async ({ email, password }: { email: string; password: string }) => {
      const result = await (
        await load({ config: cfg })
      ).login({ collection: 'firmAccounts', data: { email, password } })
      if (result.token) jar.set('payload-token', result.token)
      return result
    },
    logout: async () => jar.delete('payload-token'),
  }
})
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

const { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } =
  await import('../../app/(frontend)/(konto)/actions')
const { verifyEmailToken } = await import('../../lib/auth/verify-email')
const { outbox } = await import('../../lib/email/adapter')
const { resetMemoryLimits } = await import('../../lib/rate-limit')

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
let payload: Payload

const lastLink = (prefix: string) => {
  const text = String(outbox.at(-1)?.text ?? '')
  return new RegExp(`${prefix}/([\\w.-]+)`).exec(text)?.[1]
}

beforeAll(async () => {
  payload = await getPayload({ config })
})
beforeEach(() => resetMemoryLimits())
afterAll(async () => {
  await payload.destroy()
})

describe('rejestracja i potwierdzenie e-maila', () => {
  it('tworzy konto, wysyła link (HTML i tekst) i nie zdradza zajętego adresu', async () => {
    const first = await registerAction({
      email: 'Nowa@Firma.test',
      password: PASSWORD,
      terms: true,
    })
    expect(first.ok).toBe(true)
    expect(outbox.at(-1)).toMatchObject({
      to: 'nowa@firma.test',
      subject: 'Potwierdź adres e-mail',
    })
    expect(String(outbox.at(-1)?.html)).toContain('/potwierdz/')

    const count = outbox.length
    const again = await registerAction({
      email: 'nowa@firma.test',
      password: PASSWORD,
      terms: true,
    })
    expect(again).toEqual(first)
    expect(outbox.length).toBe(count)
  })

  it('odrzuca słabe hasło i brak zgody', async () => {
    const weak = await registerAction({
      email: 'slabe@firma.test',
      password: 'haslohaslo12',
      terms: true,
    })
    expect(weak).toMatchObject({ ok: false, fieldErrors: { password: expect.any(String) } })
    const noTerms = await registerAction({
      email: 'zgoda@firma.test',
      password: PASSWORD,
      terms: false,
    })
    expect(noTerms).toMatchObject({ ok: false, fieldErrors: { terms: expect.any(String) } })
  })

  it('logowanie przed potwierdzeniem jest blokowane, link z e-maila potwierdza adres', async () => {
    await registerAction({ email: 'weryfikacja@firma.test', password: PASSWORD, terms: true })
    const token = lastLink('/potwierdz')!
    const before = await loginAction({ email: 'weryfikacja@firma.test', password: PASSWORD })
    expect(before).toMatchObject({ ok: false, fieldErrors: { form: 'unverified' } })

    expect(await verifyEmailToken(token)).toBe('verified')
    expect(await verifyEmailToken(token)).toBe('invalid')
    await expect(
      loginAction({ email: 'weryfikacja@firma.test', password: PASSWORD, next: 'https://zly.pl' }),
    ).rejects.toThrow('REDIRECT:/panel')
  })

  it('link starszy niż 24 h wygasa', async () => {
    await registerAction({ email: 'stary@firma.test', password: PASSWORD, terms: true })
    const token = lastLink('/potwierdz')!
    const { docs } = await payload.find({
      collection: 'firmAccounts',
      where: { email: { equals: 'stary@firma.test' } },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'firmAccounts',
      id: docs[0]!.id,
      data: { verificationSentAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString() },
      overrideAccess: true,
    })
    expect(await verifyEmailToken(token)).toBe('expired')
  })
})

describe('logowanie i hasło', () => {
  it('zły e-mail i złe hasło dają ten sam komunikat, potem limit prób', async () => {
    const wrong = await loginAction({ email: 'weryfikacja@firma.test', password: 'zle-haslo' })
    const unknown = await loginAction({ email: 'nikt@firma.test', password: 'zle-haslo' })
    expect(wrong).toEqual(unknown)
    for (let i = 0; i < 5; i += 1) await loginAction({ email: 'cel@firma.test', password: 'x' })
    expect((await loginAction({ email: 'cel@firma.test', password: 'x' })).message).toMatch(
      /Za dużo prób/,
    )
  })

  it('reset hasła: ta sama odpowiedź dla nieznanego adresu, link zmienia hasło', async () => {
    const count = outbox.length
    const unknown = await forgotPasswordAction({ email: 'nikt@firma.test' })
    expect(outbox.length).toBe(count)
    const known = await forgotPasswordAction({ email: 'weryfikacja@firma.test' })
    expect(known).toEqual(unknown)
    const token = lastLink('/reset-hasla')!

    await expect(
      resetPasswordAction({ token, password: 'Nowe-Haslo-Remont-2026' }),
    ).rejects.toThrow('REDIRECT:/logowanie')
    expect(await resetPasswordAction({ token, password: 'Nowe-Haslo-Remont-2026' })).toMatchObject({
      ok: false,
    })
    await expect(
      loginAction({ email: 'weryfikacja@firma.test', password: 'Nowe-Haslo-Remont-2026' }),
    ).rejects.toThrow('REDIRECT:/panel')
  })
})
