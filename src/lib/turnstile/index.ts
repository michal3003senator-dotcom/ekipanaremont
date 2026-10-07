const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type Fetch = typeof fetch

/**
 * Weryfikacja tokenu Cloudflare Turnstile po stronie serwera. Bez klucza: poza produkcją
 * przepuszcza (lokalnie i w testach), na produkcji odrzuca – formularz nie działa bez ochrony.
 */
export async function verifyTurnstile(
  token: string | undefined,
  fetchImpl: Fetch = fetch,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return process.env.NODE_ENV !== 'production'
  if (!token) return false
  try {
    const response = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}
