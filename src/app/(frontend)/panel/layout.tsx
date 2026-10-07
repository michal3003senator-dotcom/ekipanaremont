import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

import { ThemeSwitch } from '@/components/features/ThemeSwitch'
import { PanelNav } from '@/components/layout/PanelNav'
import { Wordmark } from '@/components/layout/Wordmark'
import { getPanel } from '@/lib/panel/context'
import { readTheme, THEME_COOKIE } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Panel firmy – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Panel firmy: najpierw telefon (SPEC 3.4) – treść w jednej kolumnie, nawigacja pod kciukiem. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { firm, payload, as } = await getPanel()
  const theme = readTheme((await cookies()).get(THEME_COOKIE)?.value)
  const newInquiries = firm
    ? (
        await payload.count({
          collection: 'inquiries',
          where: { firm: { equals: firm.id }, status: { equals: 'new' } },
          ...as,
        })
      ).totalDocs
    : 0

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-4 md:px-6">
          <Wordmark className="max-sm:text-body" />
          <div className="flex min-w-0 items-center gap-3">
            {firm && (
              <p className="truncate text-small text-text-muted max-sm:hidden">{firm.name}</p>
            )}
            <ThemeSwitch initialTheme={theme} />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-page gap-8 px-4 pt-6 pb-32 md:px-6 lg:grid-cols-12 lg:pt-10 lg:pb-16">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <PanelNav variant="side" newInquiries={newInquiries} />
          </div>
        </aside>
        <main
          id="tresc"
          className="min-w-0 lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-5"
        >
          {children}
        </main>
      </div>
      <PanelNav variant="bottom" newInquiries={newInquiries} />
    </div>
  )
}
