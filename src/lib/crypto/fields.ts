import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import type { Keyring } from './keyring'

const PREFIX = 'enc:v'
const IV_BYTES = 12
const FORMAT = /^enc:v(\d+):([\w-]+):([\w-]+):([\w-]*)$/

/** Czy wartość jest już szyfrogramem – hook nie szyfruje jej drugi raz (ADR 0007). */
export const isEncrypted = (value: string) => value.startsWith(PREFIX) && FORMAT.test(value)

/**
 * AES-256-GCM z losowym IV. AAD (`kolekcja.pole`) wiąże szyfrogram z polem,
 * więc nie da się go przenieść do innego pola. Format: `enc:v{wersja}:{iv}:{tag}:{dane}` (base64url).
 */
export function encryptField(plain: string, aad: string, keyring: Keyring): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', keyring.current.key, iv)
  cipher.setAAD(Buffer.from(aad, 'utf8'))
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const parts = [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url'))
  return `${PREFIX}${keyring.current.version}:${parts.join(':')}`
}

/** Odszyfrowuje wartość dowolną znaną wersją klucza; zmieniony szyfrogram lub złe pole = błąd. */
export function decryptField(value: string, aad: string, keyring: Keyring): string {
  const match = FORMAT.exec(value)
  if (!match) throw new Error('Wartość nie jest szyfrogramem pola')
  const [, version, iv, tag, data] = match
  const key = keyring.byVersion.get(Number(version))
  if (!key) throw new Error(`Brak klucza w wersji ${version}`)

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv ?? '', 'base64url'))
  decipher.setAAD(Buffer.from(aad, 'utf8'))
  decipher.setAuthTag(Buffer.from(tag ?? '', 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(data ?? '', 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

/** Wersja klucza zapisana w szyfrogramie – do skryptu rotacji. */
export function keyVersionOf(value: string): number | null {
  const match = FORMAT.exec(value)
  return match ? Number(match[1]) : null
}
