import Link from 'next/link'

import { AvailabilityTiles } from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { cn } from '@/lib/cn'
import type { CalendarDate } from '@/lib/format/date'

import { firmArea, FirmFacts } from './FirmFacts'
import { FirmPhoto, firmPhotoTransition, initialsOf } from './FirmPhoto'
import type { FirmSummary } from './types'

type Props = {
  firm: FirmSummary
  today: CalendarDate
  /** Adres profilu; domyślnie /firma/[slug]. */
  href?: string
  className?: string
}

/**
 * Karta firmy na liście (ADR 0013): od 768 px pozioma, a paski kafli kolejnych kart stoją
 * w jednej kolumnie. Cała karta jest linkiem; zdjęcie przechodzi w nagłówek profilu.
 */
export function FirmCard({ firm, today, href = `/firma/${firm.slug}`, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group grid overflow-hidden rounded-card border border-line bg-surface-1 inset-shadow-edge transition-colors duration-400 ease-standard hover:border-line-strong md:grid-cols-12',
        className,
      )}
    >
      <FirmPhoto
        photo={firm.photo}
        fallback={initialsOf(firm.name)}
        sizes="(min-width: 768px) 25vw, 100vw"
        transitionName={firmPhotoTransition(firm.slug)}
        className="aspect-4/3 md:col-span-3"
      />
      <div className="flex flex-col gap-1 p-4 md:col-span-5 md:p-6">
        <h3 className="font-display text-h3 font-medium">{firm.name}</h3>
        <p className="text-small text-text-muted">{firm.services}</p>
        <p className="text-small text-text-muted">{firmArea(firm)}</p>
        <FirmFacts firm={firm} className="mt-auto pt-3" />
      </div>
      <div className="flex flex-col justify-center border-t border-line p-4 md:col-span-4 md:border-s md:border-t-0 md:p-6">
        <AvailabilityTiles
          today={today}
          availability={getAvailability(today, firm.availableFrom)}
          confirmedOn={firm.confirmedOn}
        />
      </div>
    </Link>
  )
}
