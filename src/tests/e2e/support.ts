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
