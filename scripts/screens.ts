/**
 * Zrzuty design labu do pętli wizualnej (CLAUDE.md, DESIGN.md §10):
 * 3 warianty × 390 i 1440 px × 2 motywy. Wymaga działającego serwera (`pnpm dev`).
 *
 * Zmienne: BASE_URL (domyślnie http://localhost:3000), SCREENS_DIR (domyślnie docs/screens/design-lab),
 * CHROMIUM_PATH (własna binarka Chromium, gdy Playwright nie ma pobranej przeglądarki).
 */
import { mkdir } from 'node:fs/promises'

import { chromium } from '@playwright/test'

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const outDir = process.env.SCREENS_DIR ?? 'docs/screens/design-lab'

const variants = ['a', 'b', 'c']
const viewports = [
  { width: 390, height: 844, deviceScaleFactor: 2 },
  { width: 1440, height: 900, deviceScaleFactor: 1 },
]
const themes = [
  { name: 'ciemny', query: '' },
  { name: 'jasny', query: '?motyw=jasny' },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })

try {
  for (const { deviceScaleFactor, ...viewport } of viewports) {
    // Ograniczony ruch: kafle od razu w stanie końcowym, zrzuty są powtarzalne.
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()

    for (const variant of variants) {
      for (const theme of themes) {
        await page.goto(`${baseUrl}/design-lab/${variant}${theme.query}`, {
          waitUntil: 'networkidle',
        })
        await page.evaluate(() => document.fonts.ready)
        const path = `${outDir}/${variant}-${viewport.width}-${theme.name}.jpg`
        await page.screenshot({ path, fullPage: true, type: 'jpeg', quality: 70 })
        process.stdout.write(`${path}\n`)
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
}
