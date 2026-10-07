import { describe, expect, it } from 'vitest'

import { formatPhone } from '../../lib/format/number'
import {
  newReviewToken,
  REVIEW_TOKEN,
  reviewLinkExpiry,
  reviewTokenHash,
} from '../../lib/reviews/token'
import { searchHref } from '../../lib/search/href'
import { parseSearchParams } from '../../lib/search/params'
import { serializeJsonLd } from '../../lib/seo/json-ld'
import { inquirySchema, reviewSchema } from '../../lib/validation/forms'

describe('parametry wyszukiwania w adresie', () => {
  it('pomija nieprawidłowe wartości zamiast rzucać błąd', () => {
    expect(
      parseSearchParams({ usluga: 'Glazurnik!', termin: '3', strona: 'abc', vat: 'tak' }),
    ).toEqual({})
    expect(parseSearchParams({ usluga: 'glazurnik', termin: '7', strona: '2' })).toEqual({
      usluga: 'glazurnik',
      termin: '7',
      strona: 2,
    })
  })

  it('zakres zawsze jako tablica, pierwsza wartość dla pól pojedynczych', () => {
    expect(parseSearchParams({ zakres: 'fugowanie', gdzie: ['lodz', 'zgierz'] })).toEqual({
      zakres: ['fugowanie'],
      gdzie: 'lodz',
    })
  })

  it('zmiana filtra wraca na 1. stronę, zmiana strony ją zachowuje', () => {
    const params = { usluga: 'glazurnik', gdzie: 'lodz', strona: 3 }
    expect(searchHref(params, { vat: '1' })).toBe('/szukaj?usluga=glazurnik&gdzie=lodz&vat=1')
    expect(searchHref(params, { strona: 4 })).toBe('/szukaj?usluga=glazurnik&gdzie=lodz&strona=4')
    expect(searchHref(params, { strona: 1 })).toBe('/szukaj?usluga=glazurnik&gdzie=lodz')
    expect(searchHref({})).toBe('/szukaj')
  })
})

describe('JSON-LD', () => {
  it('treść od użytkownika nie zamyka znacznika <script>', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('<')
    expect(JSON.parse(json)).toEqual({ name: '</script><script>alert(1)</script>' })
  })
})

describe('link do opinii', () => {
  const env = { DATA_HMAC_KEY: Buffer.alloc(32, 7).toString('base64') }

  it('token losowy, w bazie tylko skrót HMAC', () => {
    const token = newReviewToken()
    expect(token).toMatch(REVIEW_TOKEN)
    expect(newReviewToken()).not.toBe(token)
    const previous = process.env.DATA_HMAC_KEY
    process.env.DATA_HMAC_KEY = env.DATA_HMAC_KEY
    try {
      expect(reviewTokenHash(token)).toMatch(/^[0-9a-f]{64}$/)
      expect(reviewTokenHash(token)).toBe(reviewTokenHash(token))
      expect(reviewTokenHash(token)).not.toContain(token)
    } finally {
      process.env.DATA_HMAC_KEY = previous
    }
  })

  it('ważny 30 dni', () => {
    const now = Date.UTC(2026, 9, 7)
    expect(reviewLinkExpiry(now)).toBe('2026-11-06T00:00:00.000Z')
  })
})

describe('formularz zapytania', () => {
  const valid = {
    firm: 'plytka-i-fuga',
    service: '',
    locality: 'zgierz',
    description: 'Skucie płytek i nowa glazura w łazience 6 m2.',
    budgetRange: 'from10to30k',
    timeframe: 'month',
    clientName: 'Anna',
    clientEmail: ' Anna@Example.PL ',
    clientPhone: '',
    consent: true,
  }

  it('puste pola opcjonalne nie blokują wysłania, e-mail małymi literami', () => {
    const parsed = inquirySchema.safeParse(valid)
    expect(parsed.success).toBe(true)
    expect(parsed.data).toMatchObject({ clientEmail: 'anna@example.pl' })
    expect(parsed.data?.service).toBeUndefined()
    expect(parsed.data?.clientPhone).toBeUndefined()
  })

  it('wymaga opisu min. 20 znaków, miejscowości z listy, zgody i budżetu z przedziałów', () => {
    for (const patch of [
      { description: 'za krótko' },
      { locality: '' },
      { consent: false },
      { budgetRange: 'milion' },
      { clientPhone: '123' },
    ]) {
      expect(inquirySchema.safeParse({ ...valid, ...patch }).success).toBe(false)
    }
  })
})

describe('formularz opinii', () => {
  const valid = {
    token: 'a'.repeat(32),
    rating: 5,
    body: 'Terminowo, czysto i zgodnie z ustaleniami. Polecam.',
    authorDisplayName: 'Anna, Widzew',
  }

  it('podpis „Imię, miejscowość”, ocena 1–5, treść min. 30 znaków', () => {
    expect(reviewSchema.safeParse(valid).success).toBe(true)
    for (const patch of [
      { authorDisplayName: 'Anna Kowalska' },
      { rating: 0 },
      { rating: 6 },
      { body: 'Polecam.' },
      { token: 'krótki' },
    ]) {
      expect(reviewSchema.safeParse({ ...valid, ...patch }).success).toBe(false)
    }
  })
})

describe('telefon', () => {
  it('polski zapis z kierunkowym i bez', () => {
    expect(formatPhone('600100200')).toBe('600 100 200')
    expect(formatPhone('+48 600-100-200')).toBe('+48 600 100 200')
  })
})

describe('adresy treści i podglądu', () => {
  it('podgląd przekierowuje tylko w obrębie serwisu', async () => {
    const { SAFE_PATH, contentPath } = await import('../../lib/content/paths')
    expect(SAFE_PATH.test('/artykuly/remont-lazienki')).toBe(true)
    for (const path of ['//evil.com', 'https://evil.com', '/\\evil', 'javascript:alert(1)'])
      expect(SAFE_PATH.test(path)).toBe(false)
    expect(contentPath('articles', 'abc')).toBe('/artykuly/abc')
    expect(contentPath('pages', 'regulamin')).toBe('/regulamin')
    expect(contentPath('media', 'x')).toBeNull()
  })

  it('czas czytania z tekstu bloków', async () => {
    const { blocksText, readingMinutes } = await import('../../lib/content/text')
    const text = blocksText([
      { blockType: 'heading', text: 'Kolejność prac' },
      { blockType: 'faq', items: [{ question: 'Ile trwa?', answer: 'Dwa tygodnie.' }] },
      { blockType: 'calculator', calculator: 'x' },
    ])
    expect(text).toContain('Kolejność prac')
    expect(text).toContain('Dwa tygodnie.')
    expect(readingMinutes(text)).toBe(1)
    expect(readingMinutes('słowo '.repeat(1000))).toBe(5)
  })
})
