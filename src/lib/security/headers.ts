type Header = { key: string; value: string }

const PERMISSIONS_POLICY = [
  'browsing-topics=()',
  'camera=()',
  'display-capture=()',
  'geolocation=()',
  'microphone=()',
  'payment=()',
  'usb=()',
].join(', ')

/** Nagłówki stałe dla każdej odpowiedzi (CSP z nonce ustawia `src/proxy.ts`). */
export function securityHeaders({ indexable }: { indexable: boolean }): Header[] {
  const headers: Header[] = [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ]

  // Staging i lokalnie: poza indeksem wyszukiwarek (ADR 0012).
  if (!indexable) headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })

  return headers
}
