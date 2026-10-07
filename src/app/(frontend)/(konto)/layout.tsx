import { cookies } from 'next/headers'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ThemeSwitch } from '@/components/features/ThemeSwitch'
import { Wordmark } from '@/components/layout/Wordmark'
import { readTheme, THEME_COOKIE } from '@/lib/theme'

/** Konta firm: spokojny nagłówek bez menu – jedno zadanie na ekranie. */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const theme = readTheme((await cookies()).get(THEME_COOKIE)?.value)
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 md:px-6">
          <Wordmark />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-small text-text-muted transition-colors duration-150 hover:text-text max-sm:hidden"
            >
              Wróć do wyszukiwarki
            </Link>
            <ThemeSwitch initialTheme={theme} />
          </div>
        </div>
      </header>
      <main id="tresc" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
