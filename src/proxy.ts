import { type NextRequest, NextResponse } from 'next/server'

import { hmacFor } from '@/lib/crypto'
import { rateLimit } from '@/lib/rate-limit'
import { apiAuthVerdict, clientIp } from '@/lib/security/api-guard'
import { buildCsp, createNonce } from '@/lib/security/csp'
import { DRAFT_MODE_COOKIE } from '@/lib/security/headers'

/** Logowanie REST: konta firm tylko przez formularze serwisu, personel z limitem na IP. */
async function guardApi(request: NextRequest) {
  const verdict = apiAuthVerdict(request.method, request.nextUrl.pathname)
  if (verdict === 'block')
    return NextResponse.json({ errors: [{ message: 'Not Found' }] }, { status: 404 })
  if (verdict === 'limit') {
    const limit = await rateLimit('login', hmacFor('ip', clientIp(request.headers)))
    if (!limit.ok)
      return NextResponse.json(
        { errors: [{ message: 'Za dużo prób. Spróbuj za kilka minut.' }] },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
  }
  return NextResponse.next()
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) return guardApi(request)
  const nonce = createNonce()
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    upgradeInsecureRequests: request.nextUrl.protocol === 'https:',
    // Ramka tylko w podglądzie redakcji; ciasteczko podpisuje Next, ustawia je tylko /podglad.
    previewFraming: request.cookies.has(DRAFT_MODE_COOKIE),
    framesSelf: request.nextUrl.pathname.startsWith('/admin'),
  })

  // Next odczytuje nonce z nagłówka CSP żądania i dodaje go do swoich skryptów.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)
  // payload-totp ustala ścieżkę z tego nagłówka; bez niego przekierowuje w kółko na /admin/setup-totp.
  // `set` nadpisuje wartość podaną przez klienta.
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      // Bez API (JSON), tunelu Sentry, plików statycznych i prefetchu.
      source: '/((?!api|monitoring|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    // Tylko endpointy uwierzytelniania kont (reszta API bez proxy).
    '/api/firmAccounts/:path*',
    '/api/staff/:path*',
  ],
}
