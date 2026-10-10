import Link from 'next/link'

import {
  AvailabilityCaption,
  AvailabilityLegend,
  AvailabilityStrip,
  TileLabels,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { cn } from '@/lib/cn'
import { type CalendarDate, formatWeekdayInitial } from '@/lib/format/date'
import { formatRating } from '@/lib/format/number'

import { FirmPhoto, initialsOf } from './FirmPhoto'
import type { FirmSummary } from './types'

type Props = {
  firms: readonly FirmSummary[]
  today: CalendarDate
  className?: string
}

const dayLabel = (date: CalendarDate, index: number) =>
  index === 0 ? 'dziś' : `${formatWeekdayInitial(date)} ${Number(date.slice(8))}`

/** Grafik (ADR 0013): firmy na wspólnej osi 14 dni – kto może zacząć najwcześniej. */
export function FirmBoard({ firms, today, className }: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-line bg-surface-1 inset-shadow-edge',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="hidden border-b border-line px-6 py-3 text-micro uppercase tracking-caps text-text-muted lg:grid lg:grid-cols-12 lg:gap-x-6"
      >
        <span className="col-span-4">Firma</span>
        <TileLabels
          today={today}
          size="card"
          label={dayLabel}
          className="col-span-6 normal-case tracking-normal"
        />
        <span className="col-span-2">Termin</span>
      </div>
      <AvailabilityLegend className="border-b border-line px-4 py-2 lg:px-6" />
      <ol className="divide-y divide-line">
        {firms.map((firm) => {
          const availability = getAvailability(today, firm.availableFrom)
          return (
            <li
              key={firm.slug}
              className="grid gap-4 p-4 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:px-6"
            >
              <Link
                href={`/firma/${firm.slug}`}
                className="group flex items-center gap-4 lg:col-span-4"
              >
                <FirmPhoto
                  photo={firm.photo && { ...firm.photo, demo: false }}
                  fallback={initialsOf(firm.name)}
                  sizes="96px"
                  className="aspect-4/3 w-24 shrink-0 rounded-badge"
                />
                <span className="flex flex-col">
                  <span className="font-semibold">{firm.name}</span>
                  <span className="text-small text-text-muted">
                    {firm.locality}
                    {firm.rating !== null && (
                      <>
                        {' · '}
                        <span className="font-data">
                          {formatRating(firm.rating)} ({firm.reviews})
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </Link>
              <AvailabilityStrip
                today={today}
                availability={availability}
                className="lg:col-span-6"
              />
              <AvailabilityCaption
                today={today}
                availability={availability}
                confirmedOn={firm.confirmedOn}
                stacked
                className="lg:col-span-2"
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
