import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

import { isProductionDeployment } from './src/lib/runtime'
import { securityHeaders } from './src/lib/security/headers'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: dirname },
  // Zdjęcia realizacji idą po jednym, zmniejszone w przeglądarce; Vercel i tak tnie ciało żądania przy 4,5 MB.
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
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
        headers: securityHeaders({ indexable: isProductionDeployment() }),
      },
    ]
  },
}

export default withSentryConfig(withPayload(nextConfig, { devBundleServerPackages: false }), {
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
})
