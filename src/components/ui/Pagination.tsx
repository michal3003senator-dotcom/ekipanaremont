import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import { paginationRange } from '@/lib/pagination'

import { buttonVariants } from './Button'
import { Icon } from './Icon'

type Props = {
  page: number
  totalPages: number
  /** Adres strony – stan listy żyje w URL (SPEC 3.1). */
  hrefFor: (page: number) => string
  className?: string
}

export function Pagination({ page, totalPages, hrefFor, className }: Props) {
  if (totalPages <= 1) return null
  const previous = page > 1 ? page - 1 : null
  const next = page < totalPages ? page + 1 : null

  return (
    <nav
      aria-label="Strony wyników"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {previous ? (
        <Link
          href={hrefFor(previous)}
          rel="prev"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <Icon icon={ChevronLeft} />
          <span className="max-sm:sr-only">Poprzednia</span>
        </Link>
      ) : null}
      <ol className="flex items-center gap-1">
        {paginationRange(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Strona ${item}`}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                  'font-data font-medium',
                  item === page && 'border border-line-strong bg-surface-2',
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>
      {next ? (
        <Link
          href={hrefFor(next)}
          rel="next"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <span className="max-sm:sr-only">Następna</span>
          <Icon icon={ChevronRight} />
        </Link>
      ) : null}
    </nav>
  )
}
