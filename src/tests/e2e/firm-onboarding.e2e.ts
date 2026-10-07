import { execFileSync } from 'node:child_process'

import { expect as baseExpect, type Page, test } from '@playwright/test'
import sharp from 'sharp'

import { collectErrors, expectNoAxeViolations } from './support'

const PASSWORD = 'Fuga-Gres-Kielnia-48!'
// Serwer deweloperski kompiluje każdą stronę przy pierwszym wejściu – dłuższe oczekiwanie na widoki.
const expect = baseExpect.configure({ timeout: 30_000 })

// Osobny „adres IP” na przebieg – limity rejestracji (5 na godzinę) nie blokują kolejnych uruchomień.
test.use({
  extraHTTPHeaders: { 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}` },
})

/** NIP z prefiksem 000 – poprawna suma kontrolna, ale nie ma go w żadnym rejestrze (ścieżka ręczna). */
function fakeNip(seed: number): string {
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  for (let n = seed; ; n += 1) {
    const base = String(n).padStart(9, '0')
    const sum =
      weights.reduce((total, weight, index) => total + weight * Number(base[index]), 0) % 11
    if (sum < 10) return `${base}${sum}`
  }
}

function verificationToken(email: string): string {
  const output = execFileSync(
    'pnpm',
    ['-s', 'payload', 'run', 'scripts/e2e/verification-token.ts', email],
    { encoding: 'utf8' },
  )
  return output.trim().split('\n').pop()!.trim()
}

const photo = async (shade: number) => ({
  name: `budowa-${shade}.png`,
  mimeType: 'image/png',
  buffer: await sharp({
    create: { width: 1600, height: 1200, channels: 3, background: { r: shade, g: 120, b: 140 } },
  })
    .png()
    .toBuffer(),
})

/** Z kluczem Turnstile (CI: klucze testowe) czekamy na token widżetu przed wysłaniem formularza. */
async function waitForTurnstile(page: Page) {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return
  await expect
    .poll(() =>
      page
        .locator('input[name="cf-turnstile-response"]')
        .inputValue()
        .catch(() => ''),
    )
    .not.toBe('')
}

async function pickLocality(page: Page, label: string, query: string) {
  const field = page.getByRole('combobox', { name: label })
  await field.fill(query)
  await page.getByRole('option', { name: /^Łódź/ }).first().click()
}

test('rejestracja → NIP → profil → wysłanie do akceptacji; termin potwierdzony jednym dotknięciem', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000)
  const errors = collectErrors(page)
  const email = `e2e-${testInfo.project.name}-${Date.now()}@firma.test`

  // Rejestracja i potwierdzenie adresu.
  await page.goto('/rejestracja')
  await page.getByLabel('E-mail firmowy').fill(email)
  await page.getByLabel('Hasło').fill(PASSWORD)
  await page.getByText('Akceptuję').click()
  await waitForTurnstile(page)
  await page.getByRole('button', { name: 'Zakładam konto' }).click()
  await expect(page.getByText(`Sprawdź skrzynkę ${email}`)).toBeVisible()
  await page.goto(`/potwierdz/${verificationToken(email)}`)
  await expect(page.getByRole('heading', { name: 'Adres potwierdzony' })).toBeVisible()

  // Logowanie prowadzi do kreatora.
  await page.getByRole('link', { name: 'Przechodzę do logowania' }).click()
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill(PASSWORD)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await expect(page.getByRole('heading', { name: 'Zacznijmy od NIP' })).toBeVisible()

  // Krok 1: NIP spoza rejestrów – nazwa podana ręcznie.
  await page.getByLabel('NIP firmy').fill(fakeNip(Date.now() % 1e8))
  await page.getByRole('button', { name: 'Sprawdzam NIP' }).click()
  await page.getByLabel('Nazwa firmy').fill('Remonty E2E')
  await page.getByRole('button', { name: 'Zakładam profil – dalej' }).click()

  // Krok 2: usługi i obszar.
  await expect(page.getByRole('heading', { name: 'Usługi i obszar' })).toBeVisible()
  await page.getByText('Glazurnik', { exact: true }).click()
  await pickLocality(page, 'Siedziba firmy', 'lodz')
  await page.getByRole('button', { name: 'Zapisuję i przechodzę dalej' }).click()

  // Krok 3: o firmie.
  await expect(page.getByRole('heading', { name: 'O firmie' })).toBeVisible()
  await page
    .getByLabel('Krótki opis')
    .fill('Łazienki i kuchnie pod klucz w Łodzi. Płytki wielkoformatowe i odpływy liniowe.')
  await page.getByRole('button', { name: 'Zapisuję i przechodzę dalej' }).click()

  // Krok 4: realizacja z 3 zdjęciami (zmniejszanymi w przeglądarce).
  await page.getByRole('link', { name: 'Dodaję realizację' }).click()
  await page.getByLabel('Tytuł').fill('Łazienka 6 m² na Widzewie')
  await page.getByRole('button', { name: 'Zapisuję i dodaję zdjęcia' }).click()
  await expect(page.getByRole('heading', { name: 'Zdjęcia' })).toBeVisible()
  await page
    .locator('input[type=file][multiple]')
    .setInputFiles([await photo(60), await photo(120), await photo(180)])
  await expect(page.getByText('3 z 12 zdjęć', { exact: false })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Przesuń niżej: zdjęcie 1' }).click()

  // Krok 5: wysłanie do akceptacji.
  await page.goto('/panel/profil/nowy?krok=wyslij')
  await page.getByRole('button', { name: 'Wysyłam profil do akceptacji' }).click()
  await expect(page.getByText('Profil wysłany do akceptacji').first()).toBeVisible()

  // Termin: ustawienie i potwierdzenie z pulpitu jednym dotknięciem.
  await page.goto('/panel/termin')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Najbliższy wolny termin/ }).click()
  // Dziś jest zawsze w widocznym miesiącu i mieści się w zakresie (dziś do +180 dni).
  const today = new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Warsaw',
  }).format(new Date())
  await page.getByRole('button', { name: new RegExp(`(^|, )${today} `) }).click()
  await page.getByRole('button', { name: 'Potwierdzam termin' }).click()
  await expect(page.getByText('Termin potwierdzony').first()).toBeVisible()
  await page.goto('/panel')
  await page.getByRole('button', { name: 'Potwierdzam termin' }).click()
  // Reakcja od razu (stan optymistyczny), bez czekania na serwer.
  await baseExpect(page.getByText(/potwierdzony dziś/)).toBeVisible({ timeout: 1000 })

  // Dostępność ekranów panelu w obu motywach.
  for (const theme of ['ciemny', 'jasny']) {
    await page.context().addCookies([{ name: 'motyw', value: theme, url: page.url() }])
    for (const path of [
      '/panel',
      '/panel/termin',
      '/panel/zapytania',
      '/panel/realizacje',
      '/panel/wiecej',
      '/panel/ustawienia',
      '/panel/profil/nowy?krok=uslugi',
    ]) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }
  }

  expect(errors).toEqual([])
})

test('ekrany kont: bez naruszeń WCAG w obu motywach', async ({ page }) => {
  const errors = collectErrors(page)
  for (const theme of ['ciemny', 'jasny']) {
    await page.context().addCookies([{ name: 'motyw', value: theme, url: 'http://localhost:3000' }])
    for (const path of ['/rejestracja', '/logowanie', '/reset-hasla', '/potwierdz/nieprawidlowy']) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }
  }
  expect(errors).toEqual([])
})
