import { type NextRequest, NextResponse } from 'next/server'

import { buildCsp, createNonce } from '@/lib/security/csp'

export function proxy(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    upgradeInsecureRequests: request.nextUrl.protocol === 'https:',
  })

  // Next odczytuje nonce z nagłówka CSP żądania i dodaje go do swoich skryptów.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

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
  ],
}
