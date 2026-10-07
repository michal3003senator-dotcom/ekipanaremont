import type { z } from 'zod'

/** Wynik Server Action: komunikat ogólny i błędy pól (te same nazwy co w formularzu). */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> }

/** Pierwszy komunikat dla każdego pola – do pokazania pod polem (DESIGN §8). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    result[key] ??= issue.message
  }
  return result
}

export const invalid = (error: z.ZodError): ActionResult<never> => ({
  ok: false,
  message: 'Popraw zaznaczone pola.',
  fieldErrors: fieldErrors(error),
})

export const tooManyRequests = (seconds: number): ActionResult<never> => ({
  ok: false,
  message: `Za dużo prób. Spróbuj ponownie za ${Math.max(1, Math.ceil(seconds / 60))} min.`,
})
