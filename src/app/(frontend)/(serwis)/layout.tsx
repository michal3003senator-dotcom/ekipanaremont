import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { readTheme, THEME_COOKIE } from '@/lib/theme'

/** Część publiczna: przyklejony nagłówek, treść, stopka. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const theme = readTheme((await cookies()).get(THEME_COOKIE)?.value)
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader theme={theme} />
      <main id="tresc" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
