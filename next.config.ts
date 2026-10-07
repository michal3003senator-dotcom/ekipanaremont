import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

import { codespaceUrl, isProductionDeployment, withCodespaceUrl } from './src/lib/runtime'
import { DRAFT_MODE_COOKIE, securityHeaders } from './src/lib/security/headers'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Za proxy (np. GitHub Codespaces) nagłówek Host to localhost – dopuszczamy publiczny adres serwisu.
const hostOf = (url: string | undefined) => (url ? new URL(url).host : undefined)
const codespaceHost = hostOf(codespaceUrl())
const serverHost = hostOf(withCodespaceUrl().NEXT_PUBLIC_SERVER_URL)
const isDev = process.env.NODE_ENV !== 'production'
// Serwer deweloperski za przekierowaniem portów (Codespaces) – działa nawet bez zmiennych środowiska.
const DEV_TUNNELS = ['*.app.github.dev']
const actionOrigins = [serverHost, codespaceHost, ...(isDev ? DEV_TUNNELS : [])].filter(
  (host): host is string => host !== undefined,
)
if (isDev && codespaceHost)
  process.stdout.write(
    `Codespaces: serwis pod https://${codespaceHost} (akcje serwera dozwolone)\n`,
  )

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Serwer deweloperski (HMR, zasoby) otwierany przez adres Codespaces.
  allowedDevOrigins: isDev ? DEV_TUNNELS : undefined,
  turbopack: { root: dirname },
  // Sentry tylko do błędów (ADR 0011): bez kodu śledzenia wydajności i logów SDK w paczce przeglądarki.
  compiler: { define: { __SENTRY_DEBUG__: false, __SENTRY_TRACING__: false } },
  // Zdjęcia realizacji idą po jednym, zmniejszone w przeglądarce; Vercel i tak tnie ciało żądania przy 4,5 MB.
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: [...new Set(actionOrigins)],
    },
  },
  // Optymalizacja tylko zdjęć z Payload i plików z builda – bez dowolnych adresów lokalnych.
  images: {
    localPatterns: [
      { pathname: '/api/media/file/**', search: '' },
      { pathname: '/_next/static/media/**', search: '' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        missing: [{ type: 'cookie', key: DRAFT_MODE_COOKIE }],
        headers: securityHeaders({ indexable: isProductionDeployment() }),
      },
      {
        // Podgląd na żywo (ADR 0023): strona w ramce panelu /admin tej samej domeny.
        source: '/:path*',
        has: [{ type: 'cookie', key: DRAFT_MODE_COOKIE }],
        headers: securityHeaders({ indexable: isProductionDeployment(), framing: 'sameorigin' }),
      },
    ]
  },
}

/**
 * Payload dodaje `Critical-CH: Sec-CH-Prefers-Color-Scheme` dla `/:path*` (motyw panelu admina).
 * Na stronach publicznych przeglądarka ponawia wtedy pierwsze żądanie (~0,6 s na wolnym łączu),
 * a motyw i tak wybiera ciasteczko (ADR 0020) – podpowiedź zostaje tylko w `/admin`.
 */
function scopeColorSchemeHint(config: NextConfig): NextConfig {
  const headers = config.headers
  if (!headers) return config
  return {
    ...config,
    headers: async () =>
      (await headers()).map((rule) =>
        rule.headers.some((header) => header.key === 'Critical-CH')
          ? { ...rule, source: '/admin/:path*' }
          : rule,
      ),
  }
}

export default withSentryConfig(
  scopeColorSchemeHint(withPayload(nextConfig, { devBundleServerPackages: false })),
  {
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    sentryUrl: 'https://de.sentry.io/',
    // Mapy źródłowe tylko przy dostępnym tokenie (Vercel/CI); po wysyłce usuwane z builda.
    sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    silent: !process.env.CI,
    telemetry: false,
    // Zdarzenia z przeglądarki przez własną domenę: CSP zostaje przy 'self', IP nie trafia do Sentry.
    tunnelRoute: '/monitoring',
    widenClientFileUpload: true,
  },
)
