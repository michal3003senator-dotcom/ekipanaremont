import { describe, expect, it } from 'vitest'

import { parseEnv } from '../../lib/env'

const valid = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  PAYLOAD_SECRET: 'a'.repeat(32),
  NEXT_PUBLIC_SERVER_URL: 'https://ekipanatermin.pl',
  DATA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  DATA_HMAC_KEY: Buffer.alloc(32, 2).toString('base64'),
}

describe('parseEnv', () => {
  it('przyjmuje poprawną konfigurację', () => {
    expect(parseEnv(valid)).toMatchObject(valid)
  })

  it('odrzuca za krótki PAYLOAD_SECRET i nie ujawnia jego wartości', () => {
    const secret = 'krotki-sekret-123'
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: secret })).toThrow(/PAYLOAD_SECRET/)
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: secret })).not.toThrow(secret)
  })

  it('wymaga adresu bazy PostgreSQL', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mysql://localhost/db' })).toThrow(
      /DATABASE_URL/,
    )
  })

  it('przyjmuje DSN Sentry tylko z regionu UE', () => {
    const eu = 'https://key@o1.ingest.de.sentry.io/2'
    expect(parseEnv({ ...valid, NEXT_PUBLIC_SENTRY_DSN: eu }).NEXT_PUBLIC_SENTRY_DSN).toBe(eu)
    expect(() =>
      parseEnv({ ...valid, NEXT_PUBLIC_SENTRY_DSN: 'https://key@o1.ingest.us.sentry.io/2' }),
    ).toThrow(/region UE/)
  })

  it('traktuje pusty DSN jak brak Sentry', () => {
    expect(
      parseEnv({ ...valid, NEXT_PUBLIC_SENTRY_DSN: '' }).NEXT_PUBLIC_SENTRY_DSN,
    ).toBeUndefined()
  })

  it('wymaga kluczy szyfrowania o długości 32 bajtów i nie ujawnia ich wartości', () => {
    const { DATA_ENCRYPTION_KEY: _, ...withoutKey } = valid
    expect(() => parseEnv(withoutKey)).toThrow(/DATA_ENCRYPTION_KEY/)
    const short = Buffer.alloc(16, 3).toString('base64')
    expect(() => parseEnv({ ...valid, DATA_HMAC_KEY: short })).toThrow(/DATA_HMAC_KEY/)
    expect(() => parseEnv({ ...valid, DATA_HMAC_KEY: short })).not.toThrow(short)
  })
})
