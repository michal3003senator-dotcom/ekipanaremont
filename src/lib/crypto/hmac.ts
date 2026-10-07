import { createHmac, hkdfSync } from 'node:crypto'

/** Osobny klucz na cel (HKDF): skrót e-maila nie zdradza skrótu IP ani tokenu (ADR 0007). */
export type HmacPurpose = 'email' | 'ip' | 'token'

type EnvSource = Readonly<Record<string, string | undefined>>

function masterKey(env: EnvSource): Buffer {
  const raw = env.DATA_HMAC_KEY
  if (!raw) throw new Error('Brak DATA_HMAC_KEY')
  const key = Buffer.from(raw, 'base64')
  if (key.length < 32) throw new Error('DATA_HMAC_KEY musi mieć co najmniej 32 bajty w base64')
  return key
}

const subkeys = new Map<string, Buffer>()

function subkey(purpose: HmacPurpose, env: EnvSource): Buffer {
  const master = masterKey(env)
  const cacheKey = `${purpose}:${master.toString('base64')}`
  let key = subkeys.get(cacheKey)
  if (!key) {
    key = Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), `ekipanatermin:${purpose}`, 32))
    subkeys.set(cacheKey, key)
  }
  return key
}

/** HMAC-SHA256 wartości dla danego celu (hex). */
export function hmacFor(purpose: HmacPurpose, value: string, env: EnvSource = process.env): string {
  return createHmac('sha256', subkey(purpose, env)).update(value, 'utf8').digest('hex')
}

/** Skrót e-maila do wyszukiwania (wielkość liter i spacje nie mają znaczenia). */
export const emailHash = (email: string, env: EnvSource = process.env) =>
  hmacFor('email', email.trim().toLowerCase(), env)
