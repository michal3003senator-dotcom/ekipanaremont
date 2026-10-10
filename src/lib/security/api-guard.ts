/**
 * Endpointy logowania REST Payload. Konta firm logują się i resetują hasło przez Server Actions
 * (Turnstile, limity, polskie e-maile) – wersje REST tylko by je omijały (np. zalew e-maili
 * „zapomniałem hasła”). Personel loguje się przez /admin, więc REST zostaje, ale z limitem na IP.
 */
const FIRM_AUTH =
  /^\/api\/firmAccounts\/(login|forgot-password|reset-password|unlock|verify|first-register|refresh-token)(\/|$)/
const STAFF_AUTH =
  /^\/api\/staff\/(login|forgot-password|reset-password|unlock|first-register)(\/|$)/

export type ApiVerdict = 'block' | 'limit' | 'pass'

export function apiAuthVerdict(method: string, pathname: string): ApiVerdict {
  if (method !== 'POST') return 'pass'
  if (FIRM_AUTH.test(pathname)) return 'block'
  if (STAFF_AUTH.test(pathname)) return 'limit'
  return 'pass'
}

/** Pierwszy adres z `x-forwarded-for` (Vercel ustawia go sam) – jak w `clientIpHash`. */
export const clientIp = (headers: Headers) =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
