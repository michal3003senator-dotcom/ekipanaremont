import { expect as baseExpect, test } from '@playwright/test'

import { collectErrors, expectNoAxeViolations, runScript, totpCode } from './support'

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
const expect = baseExpect.configure({ timeout: 30_000 })

// Osobny „adres IP” na przebieg – limit logowań nie blokuje kolejnych uruchomień.
const randomIp = () => `203.0.113.${Math.floor(Math.random() * 250) + 1}`
test.use({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })

test('redaktor publikuje artykuł z kalkulatorem → gość liczy wynik i przechodzi do wyszukiwarki', async ({
  page,
  browser,
}, testInfo) => {
  // Panel redakcji obsługujemy na komputerze; wersję telefonu sprawdza test stron publicznych.
  test.skip(testInfo.project.name !== 'desktop', 'Panel redakcji – tylko komputer.')
  test.setTimeout(180_000)
  runScript('content')
  const secret = runScript('editor', 'redakcja-e2e@ekipa.test', PASSWORD)
  const title = `Remont łazienki E2E ${Date.now()}`

  // Logowanie personelu z drugim składnikiem (TOTP).
  await page.goto('/admin/login')
  await page.locator('input[name=email]').fill('redakcja-e2e@ekipa.test')
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin/verify-totp**')
  // Pierwsze pole kodu dostaje fokus po wczytaniu strony.
  await expect(page.locator('input:focus')).toHaveCount(1)
  await page.keyboard.type(totpCode(secret))
  await page.waitForURL(/\/admin$/)

  // Artykuł z blokiem kalkulatora.
  await page.goto('/admin/collections/articles/create')
  await page.locator('#field-title').fill(title)
  await page.getByRole('button', { name: 'Dodaj blok' }).click()
  await page.getByRole('button', { name: 'Kalkulator', exact: true }).click()
  await page
    .locator('.field-type.relationship')
    .filter({ hasText: 'Kalkulator' })
    .locator('.rs__control')
    .click()
  // Publikacja po autozapisie – inaczej spóźniony autozapis tworzy nowy szkic.
  const autosaved = page.waitForResponse(
    (response) =>
      response.url().includes('autosave=true') && response.request().method() === 'PATCH',
  )
  await page.locator('.rs__option', { hasText: 'Kalkulator kosztu remontu łazienki' }).click()
  await autosaved
  await page.getByRole('button', { name: 'Opublikuj zmiany' }).click()
  await expect(page.getByText('Aktualizacja zakończona sukcesem.')).toBeVisible()
  await expect(page.locator('#field-slug')).not.toHaveValue('')
  const slug = await page.locator('#field-slug').inputValue()

  // Gość (bez sesji personelu) widzi opublikowany artykuł i liczy wynik.
  const guestContext = await browser.newContext({ baseURL: testInfo.project.use.baseURL })
  const guest = await guestContext.newPage()
  const errors = collectErrors(guest)
  await guest.goto(`/artykuly/${slug}`)
  await expect(guest.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await guest.getByLabel('Powierzchnia podłogi').fill('6')
  await expect(guest.locator('output')).toContainText('Razem')
  await expectNoAxeViolations(guest)
  await guestContext.addCookies([{ name: 'motyw', value: 'ciemny', url: guest.url() }])
  await guest.reload()
  await expect(guest.locator('html')).toHaveAttribute('data-theme', 'dark')
  await guest.getByLabel('Powierzchnia podłogi').fill('6')
  await expectNoAxeViolations(guest)
  await guest.getByRole('link', { name: 'Znajdź firmę z wolnym terminem' }).click()
  await expect(guest).toHaveURL(/\/szukaj\?usluga=remont-lazienki/)
  expect(errors).toEqual([])
  await guestContext.close()
})

test('strony lokalne i mapa strony: tylko istniejące adresy', async ({ request }, testInfo) => {
  test.setTimeout(120_000)
  runScript('public-firm', `glazura-lokalna-${testInfo.project.name}@firma.test`, PASSWORD)
  expect((await request.get('/glazurnik/lodz')).status()).toBe(200)
  // Para z miejscowością bez strony lokalnej (nie siedziba gminy ani dzielnica) i nieznana usługa.
  expect((await request.get('/glazurnik/nie-ma-takiej-miejscowosci')).status()).toBe(404)
  expect((await request.get('/nie-ma-takiej-uslugi/lodz')).status()).toBe(404)

  const sitemap = await (await request.get('/sitemap.xml')).text()
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!))
  expect(urls.map((url) => url.pathname)).toContain('/glazurnik/lodz')
  // Próbka: strony treści i pierwsze strony lokalne odpowiadają 200.
  const sample = urls.filter((url) => !url.pathname.startsWith('/firma/')).slice(0, 40)
  for (const url of sample)
    expect([url.pathname, (await request.get(url.pathname)).status()]).toEqual([url.pathname, 200])
})

test('strony treści: bez naruszeń WCAG w obu motywach', async ({ page }) => {
  test.setTimeout(120_000)
  const calculator = runScript('content')
  const errors = collectErrors(page)
  for (const theme of ['ciemny', 'jasny']) {
    await page.context().addCookies([{ name: 'motyw', value: theme, url: 'http://localhost:3000' }])
    for (const path of [
      '/artykuly',
      '/kalkulatory',
      `/kalkulatory/${calculator}`,
      '/glazurnik/lodz',
      '/jak-sprawdzamy-opinie',
    ]) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }
  }
  expect(errors).toEqual([])
})
