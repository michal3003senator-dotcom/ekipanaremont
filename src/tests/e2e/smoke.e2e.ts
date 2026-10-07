import { type Page, expect, test } from '@playwright/test'

/** Zbiera błędy z konsoli – w tym naruszenia CSP – i nieobsłużone wyjątki strony. */
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const nonceOf = (csp: string | undefined) => csp?.match(/'nonce-([^']+)'/)?.[1]

test.describe('strona i panel', () => {
  test('strona główna działa bez błędów w konsoli', async ({ page }) => {
    const errors = collectErrors(page)
    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/Ekipa na Termin/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
    await expect(page.getByRole('heading', { level: 1, name: 'Ekipa na Termin' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('panel /admin ładuje się bez błędów w konsoli', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/admin')

    // Pusta baza: kreator pierwszego konta; w przeciwnym razie logowanie.
    // Dłuższy limit: w trybie deweloperskim panel kompiluje się przy pierwszym wejściu.
    await expect(page).toHaveURL(/\/admin\/(create-first-user|login)/, { timeout: 60_000 })
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})

test.describe('bezpieczeństwo HTTP', () => {
  test('odpowiedź ma CSP z nonce i nagłówki bezpieczeństwa', async ({ request }) => {
    const headers = (await request.get('/')).headers()
    const csp = headers['content-security-policy']

    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('camera=()')
    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('nonce jest inny przy każdym żądaniu', async ({ request }) => {
    const first = nonceOf((await request.get('/')).headers()['content-security-policy'])
    const second = nonceOf((await request.get('/')).headers()['content-security-policy'])

    expect(first).toBeTruthy()
    expect(first).not.toBe(second)
  })

  test('GraphQL Payload jest wyłączony', async ({ request }) => {
    const response = await request.post('/api/graphql', { data: { query: '{ __typename }' } })
    expect(response.status()).toBe(404)
  })

  test('gość nie czyta listy personelu przez REST', async ({ request }) => {
    const response = await request.get('/api/staff')
    expect(response.status()).toBe(403)
  })
})
