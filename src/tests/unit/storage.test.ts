import { describe, expect, it } from 'vitest'

import { r2Storage } from '../../lib/storage'

describe('pliki w R2', () => {
  it('lokalnie bez R2 – dysk, na Vercelu bez R2 – błąd startu z nazwami zmiennych', () => {
    expect(typeof r2Storage({})).toBe('function')
    expect(() => r2Storage({ VERCEL: '1' })).toThrow(/R2_ENDPOINT/)
    expect(
      typeof r2Storage({
        VERCEL: '1',
        R2_ENDPOINT: 'https://konto.eu.r2.cloudflarestorage.com',
        R2_ACCESS_KEY_ID: 'id',
        R2_SECRET_ACCESS_KEY: 'sekret',
        R2_BUCKET: 'ekipa-media',
      }),
    ).toBe('function')
  })
})
