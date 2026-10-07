import { expect, test } from '@playwright/test'

import { collectErrors, expectNoAxeViolations } from './support'

const PAGES = [
  '/styleguide',
  '/styleguide/glowna',
  '/styleguide/formularze',
  '/styleguide/nakladki',
  '/styleguide/termin',
  '/styleguide/galeria',
  '/styleguide/uklady',
  '/styleguide/stany',
  '/styleguide/przejscie',
  '/styleguide/przejscie/pracownia-glazury-kowal',
]

test.describe('styleguide', () => {
  for (const path of PAGES) {
    test(`${path}: bez błędów konsoli i naruszeń WCAG (ciemny)`, async ({ page }) => {
      const errors = collectErrors(page)
      expect((await page.goto(path))?.status()).toBe(200)
      await page.waitForLoadState('networkidle')
      await expectNoAxeViolations(page)
      expect(errors).toEqual([])
    })

    test(`${path}: bez naruszeń WCAG (jasny)`, async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: 'motyw', value: 'jasny', url: baseURL ?? '' }])
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
      await page.waitForLoadState('networkidle')
      await expectNoAxeViolations(page)
    })
  }

  test('nieistniejąca firma w przejściu zwraca 404', async ({ request }) => {
    expect((await request.get('/styleguide/przejscie/nie-ma')).status()).toBe(404)
  })
})

test.describe('obsługa klawiaturą', () => {
  test('okno: fokus w środku, Esc zamyka i wraca do przycisku', async ({ page }) => {
    await page.goto('/styleguide/nakladki')
    const trigger = page.getByRole('button', { name: 'Otwórz okno' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Potwierdzasz termin od 14 paź?' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(dialog.locator(':focus')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('potwierdzenie w oknie pokazuje powiadomienie z tym samym czasownikiem', async ({
    page,
  }) => {
    await page.goto('/styleguide/nakladki')
    await page.getByRole('button', { name: 'Otwórz okno' }).click()
    await page.getByRole('button', { name: 'Potwierdzam termin' }).click()
    await expect(page.getByText('Termin potwierdzony', { exact: true })).toBeVisible()
  })

  test('pole z podpowiedziami: litery bez polskich znaków, strzałki i Enter', async ({ page }) => {
    await page.goto('/styleguide/formularze')
    const input = page.getByRole('combobox', { name: 'Miejscowość' })
    await input.fill('lodz')
    await expect(page.getByRole('listbox', { name: 'Miejscowość' }).getByRole('option')).toHaveText(
      // Dopasowania bliżej początku nazwy są wyżej.
      [/^Łódź/, /^Aleksandrów Łódzki/, /^Konstantynów Łódzki/],
    )
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(input).toHaveValue('Aleksandrów Łódzki')
    await expect(page.getByRole('listbox')).toBeHidden()
  })

  test('zakładki przełączają się strzałkami', async ({ page }) => {
    await page.goto('/styleguide/uklady')
    await page.getByRole('tab', { name: /Realizacje/ }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Usługi' })).toHaveAttribute('aria-selected', 'true')
  })

  test('galeria: strzałka w prawo, licznik i Esc', async ({ page }) => {
    await page.goto('/styleguide/galeria')
    const first = page.getByRole('button', { name: /^Powiększ: Łazienka 6 m²/ })
    await first.click()
    await expect(page.getByText('1 z 6', { exact: true })).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByText('2 z 6', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    // Fokus wraca na miniaturę ostatnio oglądanego zdjęcia.
    await expect(page.getByRole('button', { name: /^Powiększ: Łazienka 8 m²/ })).toBeFocused()
  })

  test('kalendarz: wybór dnia', async ({ page }) => {
    await page.goto('/styleguide/formularze')
    // Na telefonie kalendarz otwiera się w dolnym panelu dopiero po hydratacji.
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /^Wolny termin/ }).click()
    await page.getByRole('button', { name: /15 października/ }).click()
    await expect(page.getByRole('button', { name: /^Wolny termin/ })).toContainText('czw., 15 paź')
  })
})

test.describe('motyw i ruch', () => {
  test('przełącznik motywu zapisuje wybór po przeładowaniu', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Na telefonie przełącznik jest w menu')
    await page.goto('/styleguide')
    await page.getByRole('button', { name: 'Jasny motyw' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find((cookie) => cookie.name === 'motyw')?.value,
      )
      .toBe('jasny')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('przejście karta → profil prowadzi do profilu z tym samym zdjęciem', async ({ page }) => {
    await page.goto('/styleguide/przejscie')
    await page.getByRole('link', { name: /Pracownia Glazury Kowal/ }).click()
    await expect(page).toHaveURL(/\/styleguide\/przejscie\/pracownia-glazury-kowal$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Pracownia Glazury Kowal' }),
    ).toBeVisible()
  })
})

test.describe('ograniczony ruch', () => {
  test.use({ reducedMotion: 'reduce' })

  test('kafle widać od razu, bez animacji', async ({ page }) => {
    await page.goto('/styleguide/termin')
    const tile = page.locator('.tiles').first().locator('.tile').last()
    await expect(tile).toHaveCSS('opacity', '1')
  })
})
