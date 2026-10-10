import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Podpisane linki (ADR 0018): `<dane base64url>.<HMAC-SHA256>` z celem, podmiotem i datą ważności.
 * Klucz `LINK_SIGNING_KEY` jest osobny od kluczy szyfrowania, więc rotacja nie psuje skrótów e-maili.
 */
export type LinkPurpose = 'confirm-availability' | 'appeal'

type Claims = { p: LinkPurpose; s: string; e: number }
type EnvSource = Readonly<Record<string, string | undefined>>

function key(env: EnvSource): Buffer {
  const raw = env.LINK_SIGNING_KEY
  if (!raw) throw new Error('Brak LINK_SIGNING_KEY')
  return Buffer.from(raw, 'base64')
}

const sign = (body: string, env: EnvSource) =>
  createHmac('sha256', key(env)).update(body).digest('base64url')

export function signLink(
  purpose: LinkPurpose,
  subject: string,
  expiresAt: Date,
  env: EnvSource = process.env,
): string {
  const claims: Claims = { p: purpose, s: subject, e: Math.floor(expiresAt.getTime() / 1000) }
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url')
  return `${body}.${sign(body, env)}`
}

/** Podmiot linku, jeśli podpis się zgadza, cel pasuje i link nie wygasł; inaczej `null`. */
export function verifyLink(
  token: string,
  purpose: LinkPurpose,
  now = new Date(),
  env: EnvSource = process.env,
): string | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = Buffer.from(sign(body, env))
  const actual = Buffer.from(signature)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<Claims>
    if (claims.p !== purpose || typeof claims.s !== 'string' || typeof claims.e !== 'number')
      return null
    return claims.e * 1000 > now.getTime() ? claims.s : null
  } catch {
    return null
  }
}
