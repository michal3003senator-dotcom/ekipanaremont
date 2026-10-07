import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

type Crumb = { label: string; href?: string }

/** Ścieżka nawigacji; ostatni element to bieżąca strona. */
export function Breadcrumbs({ items, className }: { items: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label="Ścieżka" className={cn('text-small', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline-offset-4 transition-colors duration-150 hover:text-text hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-text')}>
                  {item.label}
                </span>
              )}
              {!last && <Icon icon={ChevronRight} className="size-4" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
