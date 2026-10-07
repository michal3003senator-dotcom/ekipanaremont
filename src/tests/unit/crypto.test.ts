import { randomBytes } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { decryptField, encryptField, isEncrypted, keyVersionOf } from '../../lib/crypto/fields'
import { emailHash, hmacFor } from '../../lib/crypto/hmac'
import { loadKeyring } from '../../lib/crypto/keyring'

const key = () => randomBytes(32).toString('base64')
const AAD = 'inquiries.clientEmail'

describe('szyfrowanie pól (ADR 0007)', () => {
  const keyring = loadKeyring({ DATA_ENCRYPTION_KEY: key(), DATA_ENCRYPTION_KEY_VERSION: '1' })

  it('szyfruje i odszyfrowuje, z wersją klucza w wartości', () => {
    const value = encryptField('anna@example.pl', AAD, keyring)
    expect(value).toMatch(/^enc:v1:/)
    expect(value).not.toContain('anna')
    expect(isEncrypted(value)).toBe(true)
    expect(keyVersionOf(value)).toBe(1)
    expect(decryptField(value, AAD, keyring)).toBe('anna@example.pl')
  })

  it('ten sam tekst daje za każdym razem inny szyfrogram (losowy IV)', () => {
    expect(encryptField('tekst', AAD, keyring)).not.toBe(encryptField('tekst', AAD, keyring))
  })

  it('szyfrogramu nie da się przenieść do innego pola ani zmienić', () => {
    const value = encryptField('600 100 200', 'inquiries.clientPhone', keyring)
    expect(() => decryptField(value, 'inquiries.clientName', keyring)).toThrow()
    const tampered = value.slice(0, -2) + (value.endsWith('A') ? 'B' : 'A') + value.slice(-1)
    expect(() => decryptField(tampered, 'inquiries.clientPhone', keyring)).toThrow()
  })

  it('po rotacji odczytuje dane starym kluczem, a szyfruje nowym', () => {
    const oldKey = key()
    const before = loadKeyring({ DATA_ENCRYPTION_KEY: oldKey, DATA_ENCRYPTION_KEY_VERSION: '1' })
    const stored = encryptField('Jan', AAD, before)
    const after = loadKeyring({
      DATA_ENCRYPTION_KEY: key(),
      DATA_ENCRYPTION_KEY_VERSION: '2',
      DATA_ENCRYPTION_KEYS_PREVIOUS: `1:${oldKey}`,
    })
    expect(decryptField(stored, AAD, after)).toBe('Jan')
    expect(encryptField('Jan', AAD, after)).toMatch(/^enc:v2:/)
  })

  it('zwykły tekst nie udaje szyfrogramu', () => {
    expect(isEncrypted('enc:v1:to-nie-jest-szyfrogram')).toBe(false)
    expect(isEncrypted('anna@example.pl')).toBe(false)
  })

  it('odrzuca zły klucz bez ujawniania jego wartości', () => {
    const short = Buffer.from('za-krotki').toString('base64')
    expect(() => loadKeyring({ DATA_ENCRYPTION_KEY: short })).toThrow(/32 bajty/)
    expect(() => loadKeyring({ DATA_ENCRYPTION_KEY: short })).not.toThrow(short)
    expect(() => loadKeyring({})).toThrow(/DATA_ENCRYPTION_KEY/)
  })
})

describe('skróty HMAC', () => {
  const env = { DATA_HMAC_KEY: key() }

  it('e-mail: ten sam skrót niezależnie od wielkości liter i spacji', () => {
    expect(emailHash(' Anna@Example.PL ', env)).toBe(emailHash('anna@example.pl', env))
    expect(emailHash('anna@example.pl', env)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('każdy cel ma osobny klucz', () => {
    expect(hmacFor('ip', '203.0.113.7', env)).not.toBe(hmacFor('token', '203.0.113.7', env))
  })

  it('inny klucz główny daje inny skrót', () => {
    expect(emailHash('anna@example.pl', env)).not.toBe(
      emailHash('anna@example.pl', { DATA_HMAC_KEY: key() }),
    )
  })
})
