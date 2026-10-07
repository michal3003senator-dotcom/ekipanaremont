import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { isProductionDeployment } from '@/lib/runtime'
import { readTheme, THEME_COOKIE } from '@/lib/theme'

import { GROUPS } from './_data'

export const metadata: Metadata = {
  title: 'Styleguide – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Wszystkie komponenty we wszystkich stanach (SPEC 7). Na produkcji trasa nie istnieje. */
export default async function StyleguideLayout({ children }: { children: ReactNode }) {
  if (isProductionDeployment()) notFound()
  const theme = readTheme((await cookies()).get(THEME_COOKIE)?.value)

  return (
    <>
      <SiteHeader theme={theme} />
      <div className="mx-auto max-w-page px-4 md:px-6">
        <nav
          aria-label="Styleguide"
          className="flex gap-x-5 gap-y-1 overflow-x-auto border-b border-line py-3 text-small"
        >
          <Link href="/styleguide" className="shrink-0 font-medium">
            Styleguide
          </Link>
          {GROUPS.map((group) => (
            <Link
              key={group.slug}
              href={`/styleguide/${group.slug}`}
              className="shrink-0 text-text-muted hover:text-text"
            >
              {group.title}
            </Link>
          ))}
          <Link href="/styleguide/przejscie" className="shrink-0 text-text-muted hover:text-text">
            Przejście
          </Link>
        </nav>
        <main className="pb-24">{children}</main>
      </div>
      <SiteFooter />
    </>
  )
}
