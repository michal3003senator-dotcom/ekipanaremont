import { expect, test } from '@playwright/test'

import { collectErrors } from './support'

const PAGES = ['/design-lab', '/design-lab/a', '/design-lab/b', '/design-lab/c']

test.describe('design lab', () => {
  for (const path of PAGES) {
    test(`${path} działa bez błędów w konsoli`, async ({ page }) => {
      const errors = collectErrors(page)
      const response = await page.goto(path)

      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])
    })
  }

  test('nieznany wariant zwraca 404', async ({ request }) => {
    expect((await request.get('/design-lab/x')).status()).toBe(404)
  })

  test('strona nie trafia do wyszukiwarek', async ({ page }) => {
    await page.goto('/design-lab/a')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })

  test('termin jest opisany pełnym zdaniem dla czytników ekranu', async ({ page }) => {
    await page.goto('/design-lab/a')
    await expect(
      page
        .getByText(
          'Najbliższy wolny termin: środa, 14 października, za 7 dni. Potwierdzony wczoraj.',
        )
        .first(),
    ).toBeAttached()
  })

  test('kafle zapalają się po wejściu w ekran', async ({ page }) => {
    await page.goto('/design-lab/a')
    const strip = page.locator('.tiles').first()
    await expect(strip).not.toHaveAttribute('data-played')
    await strip.scrollIntoViewIfNeeded()
    await expect(strip).toHaveAttribute('data-played', '')
    await expect(strip.locator('.tile[data-tile="free"]')).toHaveCSS('opacity', '1')
  })

  test('zdanie w wariancie C odpowiada na zmianę miejscowości', async ({ page }) => {
    await page.goto('/design-lab/c')
    await expect(page.locator('output')).toHaveText('od 14 paź.')
    await page.getByLabel('Miejscowość').selectOption('lodz')
    await expect(page.locator('output')).toHaveText('od 14 paź.')
    await page.getByLabel('Usługa').selectOption('malowanie')
    await expect(page.locator('output')).toHaveText('od dziś.')
  })
})

test.describe('design lab przy ograniczonym ruchu', () => {
  test.use({ reducedMotion: 'reduce' })

  test('kafle widać od razu, bez animacji', async ({ page }) => {
    await page.goto('/design-lab/a')
    const lastTile = page.locator('.tiles').last().locator('.tile').last()
    await lastTile.scrollIntoViewIfNeeded()
    await expect(lastTile).toHaveCSS('opacity', '1')
  })
})
