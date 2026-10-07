import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

import { securityHeaders } from './src/lib/security/headers'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: dirname },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({ indexable: process.env.VERCEL_ENV === 'production' }),
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
