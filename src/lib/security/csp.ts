type CspOptions = {
  nonce: string
  /** Tryb deweloperski: React potrzebuje `eval` do odtwarzania stosów błędów. */
  isDev: boolean
  /** Tylko przy HTTPS – lokalnie (http://localhost) zablokowałoby zasoby. */
  upgradeInsecureRequests: boolean
}

/** Buduje Content-Security-Policy z nonce (ADR 0009). */
export function buildCsp({ nonce, isDev, upgradeInsecureRequests }: CspOptions): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    // Next i Payload ustawiają style w atrybutach; skrypty inline pozostają zablokowane.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'blob:', 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    // Cloudflare Turnstile osadza widżet w ramce (formularze kont, zapytań i zgłoszeń).
    'frame-src': ['https://challenges.cloudflare.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`)
  if (upgradeInsecureRequests) policy.push('upgrade-insecure-requests')

  return policy.join('; ')
}

/** 128 losowych bitów zakodowanych w base64 – nowy nonce dla każdego żądania. */
export function createNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}
