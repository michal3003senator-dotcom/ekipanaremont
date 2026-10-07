/**
 * Zrzuty styleguide do pętli wizualnej (CLAUDE.md, DESIGN.md §10): każdy ekran × 390 i 1440 px × 2 motywy.
 * Wymaga działającego serwera (`pnpm dev`).
 *
 * Zmienne: BASE_URL (domyślnie http://localhost:3000), SCREENS_SET (styleguide, konto, panel),
 * SCREENS_DIR (domyślnie docs/screens/styleguide),
 * SCREENS_SCALE (gęstość pikseli, domyślnie 1), CHROMIUM_PATH (własna binarka Chromium).
 */
import { mkdir } from 'node:fs/promises'

import { chromium, type Page } from '@playwright/test'

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const outDir = process.env.SCREENS_DIR ?? 'docs/screens/styleguide'
const scale = Number(process.env.SCREENS_SCALE ?? 1)

type Shot = { name: string; path: string; open?: (page: Page) => Promise<void> }

const click = (name: string) => async (page: Page) => {
  await page.getByRole('button', { name }).click()
  await page.waitForTimeout(400)
}

const STYLEGUIDE: Shot[] = [
  { name: 'glowna', path: '/styleguide/glowna' },
  { name: 'formularze', path: '/styleguide/formularze' },
  { name: 'nakladki-okno', path: '/styleguide/nakladki', open: click('Otwórz okno') },
  { name: 'nakladki-panel', path: '/styleguide/nakladki', open: click('Otwórz panel') },
  { name: 'termin', path: '/styleguide/termin' },
  {
    name: 'galeria',
    path: '/styleguide/galeria',
    open: click('Powiększ: Łazienka 6 m², Łódź-Widzew · wrzesień 2026'),
  },
  { name: 'uklady', path: '/styleguide/uklady' },
  { name: 'stany', path: '/styleguide/stany' },
  { name: 'profil', path: '/styleguide/przejscie/pracownia-glazury-kowal' },
]
const ACCOUNT: Shot[] = [
  { name: 'rejestracja', path: '/rejestracja' },
  { name: 'logowanie', path: '/logowanie' },
  { name: 'reset-hasla', path: '/reset-hasla' },
]

const PANEL: Shot[] = [
  { name: 'pulpit', path: '/panel' },
  { name: 'termin', path: '/panel/termin' },
  { name: 'zapytania', path: '/panel/zapytania' },
  { name: 'realizacje', path: '/panel/realizacje' },
  { name: 'opinie', path: '/panel/opinie' },
  { name: 'wiecej', path: '/panel/wiecej' },
  { name: 'kreator-uslugi', path: '/panel/profil/nowy?krok=uslugi' },
  { name: 'kreator-o-firmie', path: '/panel/profil/nowy?krok=o-firmie' },
  { name: 'ustawienia', path: '/panel/ustawienia' },
]

// SCREENS_SET: styleguide (domyślnie), konto, panel. Panel wymaga konta: SCREENS_EMAIL i SCREENS_PASSWORD.
const SETS: Record<string, Shot[]> = { styleguide: STYLEGUIDE, konto: ACCOUNT, panel: PANEL }
const SHOTS = SETS[process.env.SCREENS_SET ?? 'styleguide'] ?? STYLEGUIDE

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]
const THEMES = ['ciemny', 'jasny'] as const

/** Przewija stronę, żeby wczytać leniwe zdjęcia, i czeka na ich pobranie. */
async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete))
}

/** Logowanie kontem firmy przez formularz (jak użytkownik), ciasteczko zostaje w kontekście. */
async function login(page: Page) {
  const email = process.env.SCREENS_EMAIL ?? 'demo@ekipanatermin.test'
  const password = process.env.SCREENS_PASSWORD ?? process.env.SEED_DEMO_PASSWORD
  if (!password) throw new Error('Ustaw SCREENS_PASSWORD albo SEED_DEMO_PASSWORD')
  await page.goto(`${baseUrl}/logowanie`, { waitUntil: 'networkidle' })
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill(password)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await page.waitForURL(`${baseUrl}/panel`)
}

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })

try {
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      // Ograniczony ruch: stany końcowe, zrzuty powtarzalne. Motyw jak u użytkownika – z ciasteczka.
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: scale,
        reducedMotion: 'reduce',
      })
      if (theme === 'jasny')
        await context.addCookies([{ name: 'motyw', value: 'jasny', url: baseUrl }])
      const page = await context.newPage()
      if (process.env.SCREENS_SET === 'panel') await login(page)

      for (const shot of SHOTS) {
        await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await loadLazyImages(page)
        // Wskaźnik trybu deweloperskiego Next nie należy do projektu.
        await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
        if (shot.open) await shot.open(page)
        const path = `${outDir}/${shot.name}-${viewport.width}-${theme}.jpg`
        await page.screenshot({ path, fullPage: !shot.open, type: 'jpeg', quality: 60 })
      }
      await context.close()
    }
  }
  process.stdout.write(`Zrzuty: ${SHOTS.length * VIEWPORTS.length * THEMES.length} w ${outDir}\n`)
} finally {
  await browser.close()
}
