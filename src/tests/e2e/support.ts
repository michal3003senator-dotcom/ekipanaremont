import { execFileSync } from 'node:child_process'

import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Zbiera błędy z konsoli – w tym naruszenia CSP – i nieobsłużone wyjątki strony. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

/** WCAG 2.2 AA (w tym kontrast) – lista naruszeń musi być pusta. */
export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const summary = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  )
  expect(summary).toEqual([])
}

/** Skrypt pomocniczy E2E (`scripts/e2e`, tylko lokalna baza) – wynik to linia z prefiksem `=> `. */
export function runScript(name: string, ...args: string[]): string {
  const output = execFileSync('pnpm', ['-s', 'payload', 'run', `scripts/e2e/${name}.ts`, ...args], {
    encoding: 'utf8',
  })
  // Logi Payload (np. „e-mail niewysłany”) mogą przyjść po wyniku – bierzemy tylko linię wyniku.
  const result = output.split('\n').findLast((line) => line.startsWith('=> '))
  if (result === undefined) throw new Error(`Skrypt ${name} nie zwrócił wyniku.`)
  return result.slice(3).trim()
}

/** Z kluczem Turnstile (CI: klucze testowe) czekamy na token widżetu przed wysłaniem formularza. */
export async function waitForTurnstile(page: Page) {
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

/** Wybór miejscowości z podpowiedzi (TERYT) – fraza może mieć literówkę. */
export async function pickLocality(page: Page, label: string, query: string, option = /^Łódź/) {
  await page.getByRole('combobox', { name: label }).fill(query)
  await page.getByRole('option', { name: option }).first().click()
}
