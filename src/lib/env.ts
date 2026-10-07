import { z } from 'zod'

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)

const sentryDsn = z
  .url({ protocol: /^https$/ })
  .refine((value) => new URL(value).hostname.endsWith('.ingest.de.sentry.io'), {
    message: 'DSN Sentry musi wskazywać region UE (*.ingest.de.sentry.io)',
  })

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET musi mieć co najmniej 32 znaki'),
  NEXT_PUBLIC_SERVER_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, sentryDsn.optional()),
})

export type Env = z.infer<typeof envSchema>

/** Waliduje zmienne środowiskowe. Komunikat błędu nigdy nie zawiera wartości. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `- ${issue.path.join('.')}: ${issue.message}`,
    )
    throw new Error(`Nieprawidłowe zmienne środowiskowe:\n${problems.join('\n')}`)
  }
  return result.data
}

export const env = parseEnv(process.env)
