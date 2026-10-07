import type { BrowserOptions } from '@sentry/nextjs'

/**
 * Wspólne ustawienia Sentry (ADR 0011): tylko błędy, bez Session Replay i bez danych osobowych.
 * Domyślnie SDK zbiera m.in. ciasteczka, nagłówki, treść żądań i zmienne lokalne – wszystko wyłączone.
 */
export function sentryOptions(): BrowserOptions {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    dataCollection: {
      cookies: false,
      databaseQueryData: false,
      genAI: { inputs: false, outputs: false },
      graphQL: { document: false, variables: false },
      httpBodies: [],
      httpHeaders: false,
      queues: false,
      stackFrameVariables: false,
      urlQueryParams: false,
      userInfo: false,
    },
  }
}
