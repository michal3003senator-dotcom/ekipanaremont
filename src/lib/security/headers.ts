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

/** Ciasteczko trybu podglądu Next (`draftMode`) – ustawia je tylko `/podglad` redakcji (ADR 0023). */
export const DRAFT_MODE_COOKIE = '__prerender_bypass'

type Options = {
  indexable: boolean
  /** Podgląd na żywo: strona w ramce panelu /admin z tej samej domeny (ADR 0023). */
  framing?: 'deny' | 'sameorigin'
}

/** Nagłówki stałe dla każdej odpowiedzi (CSP z nonce ustawia `src/proxy.ts`). */
export function securityHeaders({ indexable, framing = 'deny' }: Options): Header[] {
  const headers: Header[] = [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: framing === 'sameorigin' ? 'SAMEORIGIN' : 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ]

  // Staging i lokalnie: poza indeksem wyszukiwarek (ADR 0012).
  if (!indexable) headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })

  return headers
}
