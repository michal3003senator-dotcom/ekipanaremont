'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

import { PANEL_ITEMS, PanelBottomNav, panelSectionOf } from './PanelBottomNav'

/**
 * Nawigacja panelu: na telefonie dolny pasek (kciuk, jedna ręka), od 1024 px pionowa lista
 * po lewej. Bieżąca sekcja z adresu.
 */
export function PanelNav({
  variant,
  newInquiries = 0,
}: {
  variant: 'bottom' | 'side'
  newInquiries?: number
}) {
  const current = panelSectionOf(usePathname())
  if (variant === 'bottom') {
    return (
      <PanelBottomNav
        current={current}
        newInquiries={newInquiries}
        className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      />
    )
  }
  return (
    <nav aria-label="Panel firmy">
      <ul className="flex flex-col gap-1">
        {PANEL_ITEMS.map((item) => {
          const active = item.key === current
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-control px-3 text-small transition-colors duration-150',
                  active
                    ? 'bg-surface-2 font-medium text-text'
                    : 'text-text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                <Icon icon={item.icon} className="size-5" />
                {item.label}
                {item.key === 'zapytania' && newInquiries > 0 && (
                  <span className="ms-auto rounded-full bg-accent px-2 font-data text-micro text-on-accent tabular-nums">
                    {newInquiries}
                    <span className="sr-only"> nowe</span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
