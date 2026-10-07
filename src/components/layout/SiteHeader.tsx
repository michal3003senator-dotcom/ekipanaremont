import Link from 'next/link'

import { ThemeSwitch } from '@/components/features/ThemeSwitch'
import { Button } from '@/components/ui/Button'
import type { Theme } from '@/lib/theme'

import { MobileMenu } from './MobileMenu'
import { SITE_NAV } from './nav'
import { Wordmark } from './Wordmark'

/** Przyklejony nagłówek z rozmytym tłem – jedyne miejsce ze „szkłem” (DESIGN §2). */
export function SiteHeader({ theme }: { theme: Theme }) {
  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 px-4 md:px-6">
        <Wordmark />
        <nav aria-label="Menu główne" className="hidden md:block">
          <ul className="flex items-center gap-6 text-small">
            {SITE_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-text-muted transition-colors duration-150 hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="max-md:hidden">
            <Link href="/logowanie">Zaloguj się</Link>
          </Button>
          <ThemeSwitch initialTheme={theme} className="max-md:hidden" />
          <MobileMenu links={SITE_NAV} theme={theme} />
        </div>
      </div>
    </header>
  )
}
