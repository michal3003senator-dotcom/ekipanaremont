import * as Sentry from '@sentry/nextjs'

import { sentryOptions } from './lib/observability/sentry'

export function register() {
  Sentry.init(sentryOptions())
}

export const onRequestError = Sentry.captureRequestError
