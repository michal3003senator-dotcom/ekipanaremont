import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import { VARIANTS, type VariantKey } from '../_data'

export type Theme = 'dark' | 'light'

/** Motyw ze zmiennej adresu: `?motyw=jasny` (do zrzutów i porównań). */
export const themeFromParam = (value: string | string[] | undefined): Theme =>
  value === 'jasny' ? 'light' : 'dark'

type Props = {
  set: VariantKey
  theme: Theme
  current?: VariantKey
  children: ReactNode
}

const linkClass = (active: boolean) =>
  cx(
    'underline-offset-4 transition-colors duration-150 hover:text-text',
    active ? 'text-text underline decoration-accent decoration-2' : 'text-text-muted',
  )

/** Pasek design labu nad wariantem: przełącznik wariantów i motywu. */
export function LabShell({ set, theme, current, children }: Props) {
  const base = current ? `/design-lab/${current}` : '/design-lab'
  const themeQuery = theme === 'light' ? '?motyw=jasny' : ''

  return (
    <div
      data-set={set}
      data-theme={theme === 'light' ? 'light' : undefined}
      className="min-h-dvh bg-bg font-sans text-text"
    >
      <div className="border-b border-line bg-surface-1 text-small">
        <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <Link href={`/design-lab${themeQuery}`} className={linkClass(!current)}>
            Design lab
          </Link>
          <nav aria-label="Warianty" className="flex flex-wrap gap-x-4 gap-y-1">
            {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
              <Link
                key={key}
                href={`/design-lab/${key}${themeQuery}`}
                aria-current={key === current ? 'page' : undefined}
                className={linkClass(key === current)}
              >
                {key.toUpperCase()} „{VARIANTS[key].name}”
              </Link>
            ))}
          </nav>
          <nav aria-label="Motyw" className="flex gap-4 md:ms-auto">
            <Link
              href={base}
              aria-current={theme === 'dark'}
              className={linkClass(theme === 'dark')}
            >
              Ciemny
            </Link>
            <Link
              href={`${base}?motyw=jasny`}
              aria-current={theme === 'light'}
              className={linkClass(theme === 'light')}
            >
              Jasny
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
