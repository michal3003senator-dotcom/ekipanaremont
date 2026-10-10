import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ThemeSwitch } from '@/components/features/ThemeSwitch'
import { readTheme, THEME_COOKIE } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Moderacja – Ekipa na Termin',
  robots: { index: false, follow: false },
  // Instalacja jako aplikacja na telefonie moderatora (SPEC 3.11).
  manifest: '/moderacja/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Moderacja', statusBarStyle: 'default' },
}

export const viewport: Viewport = { viewportFit: 'cover' }

/** Centrum moderacji: jedna kolumna, akcje pod kciukiem; dostęp sprawdza strona i każda akcja. */
export default async function ModerationLayout({ children }: { children: ReactNode }) {
  const theme = readTheme((await cookies()).get(THEME_COOKIE)?.value)
  return (
    <div className="safe-bottom min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/moderacja" className="font-display text-lead">
            Moderacja
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-small text-text-muted underline underline-offset-4">
              Panel
            </Link>
            <ThemeSwitch initialTheme={theme} />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">{children}</main>
    </div>
  )
}
