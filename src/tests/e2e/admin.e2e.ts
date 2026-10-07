import { expect as baseExpect, test } from '@playwright/test'

import { collectErrors, runScript, totpCode } from './support'

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
const expect = baseExpect.configure({ timeout: 30_000 })

// Osobny „adres IP” na przebieg – limit logowań nie blokuje kolejnych uruchomień.
const randomIp = () => `203.0.113.${Math.floor(Math.random() * 250) + 1}`
test.use({ extraHTTPHeaders: { 'x-forwarded-for': randomIp() } })

test('nowe konto personelu: logowanie → konfiguracja 2FA → panel (bez pętli przekierowań)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Panel personelu – jeden przebieg wystarczy.')
  test.setTimeout(120_000)
  const email = 'moderator-e2e@ekipa.test'
  runScript('staff', email, PASSWORD)
  const errors = collectErrors(page)

  await page.goto('/admin/login')
  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.locator('button[type=submit]').click()
  await page.waitForURL('**/admin/setup-totp**')
  await expect(page.getByRole('heading', { name: /uwierzytelniania dwuetapowego/ })).toBeVisible()

  // Sekret wpisywany ręcznie zamiast skanowania kodu QR.
  await page.getByText('Dodaj kod ręcznie').click()
  const secret = (await page.locator('body').innerText()).match(
    /(?:[A-Z2-7]{4} ){8,}[A-Z2-7]+/,
  )?.[0]
  expect(secret).toBeDefined()
  // Pierwsza kratka kodu (przed nimi ukryte pole formularza) – fokus wraca na nią po pokazaniu sekretu.
  await page.getByRole('textbox').nth(1).focus()
  await page.keyboard.type(totpCode(secret!.replaceAll(' ', '')))
  await page.waitForURL(/\/admin$/)
  await expect(
    page.getByRole('link', { name: 'Treści' }).or(page.getByText('Treści')).first(),
  ).toBeVisible()
  expect(errors).toEqual([])
})
