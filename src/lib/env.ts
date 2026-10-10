import { z } from 'zod'

import { withCodespaceUrl } from './runtime'

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)

const sentryDsn = z
  .url({ protocol: /^https$/ })
  .refine((value) => new URL(value).hostname.endsWith('.ingest.de.sentry.io'), {
    message: 'DSN Sentry musi wskazywać region UE (*.ingest.de.sentry.io)',
  })

const base64Key = (name: string) =>
  z
    .string({ error: `Brak ${name} – uruchom: pnpm env:init` })
    .refine((value) => Buffer.from(value, 'base64').length === 32, {
      message: `${name} musi mieć 32 bajty w base64 – uruchom: pnpm env:init`,
    })

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET musi mieć co najmniej 32 znaki'),
  NEXT_PUBLIC_SERVER_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, sentryDsn.optional()),
  DATA_ENCRYPTION_KEY: base64Key('DATA_ENCRYPTION_KEY'),
  DATA_HMAC_KEY: base64Key('DATA_HMAC_KEY'),
  LINK_SIGNING_KEY: base64Key('LINK_SIGNING_KEY'),
  CRON_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(32, 'CRON_SECRET musi mieć co najmniej 32 znaki').optional(),
  ),
  VERCEL_ENV: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  TURNSTILE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
})

/**
 * Produkcja (Vercel `production`) bez tych usług działałaby pozornie: limity tylko w pamięci jednej
 * instancji, formularze odrzucane bez Turnstile, e-maile w pamięci. Lepiej nie wystartować.
 */
const PRODUCTION_REQUIRED = [
  'CRON_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'TURNSTILE_SECRET_KEY',
  'SMTP_HOST',
] as const

const checkedEnvSchema = envSchema.superRefine((value, ctx) => {
  if (value.VERCEL_ENV !== 'production') return
  for (const name of PRODUCTION_REQUIRED)
    if (!value[name])
      ctx.addIssue({ code: 'custom', path: [name], message: `${name} jest wymagany na produkcji` })
})

export type Env = z.infer<typeof checkedEnvSchema>

/** Waliduje zmienne środowiskowe. Komunikat błędu nigdy nie zawiera wartości. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = checkedEnvSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `- ${issue.path.join('.')}: ${issue.message}`,
    )
    throw new Error(`Nieprawidłowe zmienne środowiskowe:\n${problems.join('\n')}`)
  }
  return result.data
}

export const env = parseEnv(withCodespaceUrl(process.env))
