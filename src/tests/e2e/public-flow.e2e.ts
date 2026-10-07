import { expect as baseExpect, test } from '@playwright/test'

import {
  collectErrors,
  expectNoAxeViolations,
  pickLocality,
  runScript,
  waitForTurnstile,
} from './support'

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
const expect = baseExpect.configure({ timeout: 30_000 })

// Osobny „adres IP” na przebieg – limity zapytań i opinii nie blokują kolejnych uruchomień.
const randomIp = () => `203.0.113.${Math.floor(Math.random() * 250) + 1}`
test.use({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })

test('wyszukanie → profil → zapytanie → panel firmy → link do opinii → opinia czeka na moderację', async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(240_000)
  const errors = collectErrors(page)
  // Nowe konto firmy na przebieg – limit logowań na adres (5 na 15 min) nie blokuje powtórek.
  const run = `${testInfo.project.name}-${Date.now()}`
  const firmEmail = `glazura-${run}@firma.test`
  const client = `klient-${run}@example.test`
  runScript('public-firm', firmEmail, PASSWORD)

  // Wyszukiwanie: usługa i miejscowość z literówką, wyniki od najbliższego terminu.
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Czego szukasz?' }).fill('glazur')
  await page
    .getByRole('option', { name: /^Glazurnik/ })
    .first()
    .click()
  await pickLocality(page, 'Gdzie?', 'lodz')
  await page.getByRole('button', { name: 'Szukam' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Glazurnik, Łódź/ })).toBeVisible()
  // Nawigacja po stronie klienta: tytuł dochodzi po treści – axe sprawdza gotową stronę.
  await expect(page).toHaveTitle(/Glazurnik/)
  await expectNoAxeViolations(page)
  await page
    .getByRole('link', { name: /Glazura E2E/ })
    .first()
    .click()

  // Profil i formularz zapytania.
  await expect(page.getByRole('heading', { level: 1, name: 'Glazura E2E' })).toBeVisible()
  await expect(page).toHaveTitle(/Glazura E2E/)
  await expectNoAxeViolations(page)
  await page.getByRole('combobox', { name: 'Miejscowość' }).fill('zgiez')
  await page
    .getByRole('option', { name: /^Zgierz/ })
    .first()
    .click()
  await page
    .getByLabel('Opis prac')
    .fill('Skucie starych płytek i położenie nowych w łazience, około 6 m2.')
  await page.getByLabel('Budżet').selectOption('from10to30k')
  await page.getByLabel('Planowany termin').selectOption('month')
  await page.getByLabel('Imię').fill('Anna')
  await page.getByLabel('E-mail').fill(client)
  await page.getByRole('checkbox', { name: /Zgadzam się/ }).check()
  await waitForTurnstile(page)
  await page.getByRole('button', { name: 'Wyślij zapytanie' }).last().click()
  await expect(page.getByRole('heading', { name: 'Zapytanie wysłane' })).toBeVisible()
  await expect(page).toHaveURL(/\/firma\/glazura-e2e[\w-]*\/wyslane$/)

  // Firma widzi zapytanie w panelu.
  await page.goto('/logowanie')
  await page.getByLabel('E-mail').fill(firmEmail)
  await page.getByLabel('Hasło').fill(PASSWORD)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await page.waitForURL('**/panel**')
  await page.goto('/panel/zapytania')
  await expect(page.getByText('Glazurnik, Zgierz').first()).toBeVisible()

  // Klient (osobna przeglądarka): link do opinii z zadania requestReviews i opinia z linku.
  const clientContext = await browser.newContext({
    extraHTTPHeaders: { 'x-forwarded-for': randomIp() },
  })
  const clientPage = await clientContext.newPage()
  const clientErrors = collectErrors(clientPage)
  await clientPage.goto(runScript('review-link', client))
  await expect(clientPage.getByRole('heading', { level: 1, name: 'Glazura E2E' })).toBeVisible()
  await expectNoAxeViolations(clientPage)
  await clientPage.getByRole('radio', { name: /^5 –/ }).check({ force: true })
  await clientPage
    .getByLabel('Opinia')
    .fill('Szybki kontakt, konkretna wycena i termin dotrzymany co do dnia. Polecam.')
  await clientPage.getByLabel('Podpis').fill('Anna, Zgierz')
  await clientPage.getByRole('button', { name: 'Wysyłam opinię' }).click()
  await expect(clientPage.getByText('Opinia wysłana').first()).toBeVisible()
  await clientContext.close()

  // Opinia czeka na moderację w panelu firmy.
  await page.goto('/panel/opinie')
  await expect(page.getByText('Czeka na moderację').first()).toBeVisible()

  expect([...errors, ...clientErrors]).toEqual([])
})

test('ekrany publiczne: bez naruszeń WCAG w obu motywach', async ({ page }, testInfo) => {
  runScript('public-firm', `glazura-axe-${testInfo.project.name}@firma.test`, PASSWORD)
  const errors = collectErrors(page)
  for (const theme of ['ciemny', 'jasny']) {
    await page.context().addCookies([{ name: 'motyw', value: theme, url: 'http://localhost:3000' }])
    for (const path of [
      '/',
      '/szukaj?usluga=glazurnik&gdzie=lodz',
      '/szukaj?gdzie=nie-ma-takiej-miejscowosci&termin=7',
      '/firma/glazura-e2e',
      '/opinia/nieprawidlowy-link-do-opinii',
    ]) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }
  }
  expect(errors).toEqual([])
})
