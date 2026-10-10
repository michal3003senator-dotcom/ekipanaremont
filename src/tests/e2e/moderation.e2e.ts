import { expect as baseExpect, type Page, test } from '@playwright/test'

import { collectErrors, expectNoAxeViolations, runScript, totpCode } from './support'

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
const expect = baseExpect.configure({ timeout: 30_000 })

const randomIp = () => `203.0.113.${Math.floor(Math.random() * 250) + 1}`
test.use({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })

async function loginAsModerator(page: Page, email: string, secret: string) {
  await page.goto('/admin/login')
  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin/verify-totp**')
  await expect(page.locator('input:focus')).toHaveCount(1)
  await page.keyboard.type(totpCode(secret))
  await page.waitForURL(/\/admin$/)
}

test('bez logowania centrum moderacji prosi o panel z 2FA', async ({ page }) => {
  await page.goto('/moderacja')
  await expect(page.getByRole('heading', { name: 'Zaloguj się do panelu' })).toBeVisible()
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/)
})

test('moderator zatwierdza profil z telefonu jednym dotknięciem', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  // Osobne konto na projekt – projekty biegną równolegle.
  const email = `moderacja-${testInfo.project.name}@ekipa.test`
  const secret = runScript('editor', email, PASSWORD, 'moderator')
  const firm = runScript('moderation')
  await loginAsModerator(page, email, secret)
  const errors = collectErrors(page)

  // Otwarcie aplikacji = kolejka z oczekującymi; zatwierdzenie to jedno dotknięcie.
  await page.goto(`/moderacja?k=firmy&q=${encodeURIComponent(firm)}`)
  const card = page.getByRole('article').filter({ hasText: firm })
  await expect(card).toBeVisible()
  if (testInfo.project.name.startsWith('mobile')) {
    const box = await card.getByRole('button', { name: 'Zatwierdzam' }).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }
  await card.getByRole('button', { name: 'Zatwierdzam' }).click()
  await expect(page.getByText('Zapisano decyzję', { exact: true })).toBeVisible()
  await expect(card).toHaveCount(0)

  // Odrzucenie wymaga uzasadnienia.
  const second = runScript('moderation')
  await page.goto(`/moderacja?k=firmy&q=${encodeURIComponent(second)}`)
  const next = page.getByRole('article').filter({ hasText: second })
  await next.getByRole('button', { name: 'Do poprawy' }).click()
  await next.getByRole('button', { name: 'Odsyłam do poprawy' }).click()
  await expect(next.getByText(/co najmniej 10 znaków/)).toBeVisible()
  await next
    .getByRole('textbox')
    .fill('Opis zawiera numer telefonu w treści – przenieś go do pola Telefon.')
  await next.getByRole('button', { name: 'Odsyłam do poprawy' }).click()
  await expect(next).toHaveCount(0)

  await expectNoAxeViolations(page)
  expect(errors).toEqual([])
})

test('gość zgłasza profil firmy z okna „Zgłoś”', async ({ page }) => {
  test.setTimeout(120_000)
  runScript('public-firm', `zgloszenie-${Date.now()}@firma.test`, PASSWORD)
  const errors = collectErrors(page)
  await page.goto('/firma/glazura-e2e')
  await page
    .getByRole('region', { name: 'Dane z rejestru' })
    .getByRole('button', { name: 'Zgłoś' })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Zgłoś: profil firmy' })
  await dialog.getByLabel('Powód').selectOption('fake')
  await dialog.getByLabel('Co jest nie tak?').fill('Zdjęcia realizacji pochodzą z innej strony.')
  await dialog.getByLabel('E-mail').fill('zglaszajacy@example.com')
  await dialog.getByRole('checkbox').click()
  await expectNoAxeViolations(page)
  await dialog.getByRole('button', { name: 'Wysyłam zgłoszenie' }).click()
  await expect(dialog.getByText('Zgłoszenie przyjęte')).toBeVisible()
  expect(errors).toEqual([])
})
