import { CalendarDays, Ellipsis, House, Images, Inbox, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export type PanelSection = 'pulpit' | 'termin' | 'zapytania' | 'realizacje' | 'wiecej'

export const PANEL_ITEMS: ReadonlyArray<{
  key: PanelSection
  href: string
  label: string
  icon: LucideIcon
}> = [
  { key: 'pulpit', href: '/panel', label: 'Pulpit', icon: House },
  { key: 'termin', href: '/panel/termin', label: 'Termin', icon: CalendarDays },
  { key: 'zapytania', href: '/panel/zapytania', label: 'Zapytania', icon: Inbox },
  { key: 'realizacje', href: '/panel/realizacje', label: 'Realizacje', icon: Images },
  { key: 'wiecej', href: '/panel/wiecej', label: 'Więcej', icon: Ellipsis },
]

/** Sekcja panelu dla ścieżki: `/panel/zapytania/123` → `zapytania`; profil, opinie, ustawienia → `wiecej`. */
export function panelSectionOf(pathname: string): PanelSection {
  const segment = pathname.split('/')[2]
  if (!segment) return 'pulpit'
  return PANEL_ITEMS.some((item) => item.key === segment) ? (segment as PanelSection) : 'wiecej'
}

type Props = {
  current: PanelSection
  /** Liczba nowych zapytań przy zakładce. */
  newInquiries?: number
  className?: string
}

/** Dolna nawigacja panelu firmy na telefonie (SPEC 3.4) z odstępem na pasek systemowy. */
export function PanelBottomNav({ current, newInquiries = 0, className }: Props) {
  return (
    <nav
      aria-label="Panel firmy"
      className={cn('panel-nav border-t border-line bg-surface-1', className)}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {PANEL_ITEMS.map((item) => {
          const active = item.key === current
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-micro transition-colors duration-150',
                  active ? 'font-medium text-text' : 'text-text-muted hover:text-text',
                )}
              >
                <span className="relative">
                  <Icon icon={item.icon} className="size-6" />
                  {item.key === 'zapytania' && newInquiries > 0 && (
                    <span className="absolute -end-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-data text-micro text-on-accent">
                      {newInquiries}
                      <span className="sr-only"> nowe</span>
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
