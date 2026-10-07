'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { ThemeSwitch } from '@/components/features/ThemeSwitch'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'
import type { Theme } from '@/lib/theme'

import type { NavLink } from './nav'

/** Menu na telefonie w dolnym panelu – w zasięgu kciuka. */
export function MobileMenu({
  links,
  secondary = [],
  theme,
}: {
  links: readonly NavLink[]
  /** Strony informacyjne (regulamin, kontakt, …) – mniejsze, pod głównym menu. */
  secondary?: readonly NavLink[]
  theme: Theme
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Menu" className="md:hidden">
          <Icon icon={Menu} />
        </Button>
      </SheetTrigger>
      <SheetContent title="Menu" onDismiss={() => setOpen(false)}>
        <nav aria-label="Menu główne">
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-lead"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {secondary.length > 0 && (
          <nav aria-label="Informacje">
            <ul className="grid grid-cols-2 gap-x-4 text-small">
              {secondary.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center text-text-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary" size="sm">
            <Link href="/logowanie" onClick={() => setOpen(false)}>
              Zaloguj się
            </Link>
          </Button>
          <ThemeSwitch initialTheme={theme} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
