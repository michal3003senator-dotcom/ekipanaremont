import type { CSSProperties, ReactNode } from 'react'

import { cx } from '../../../lib/cx'
import { type CalendarDate, formatShortDate, formatWeekdayInitial } from '../../../lib/format/date'
import {
  type Availability,
  availabilityDescription,
  availabilityLabel,
  buildTiles,
  confirmedLabel,
  revealStaggerMs,
} from './model'
import { TilesReveal } from './TilesReveal'

export type TileSize = 'card' | 'profile' | 'hero'

type StripProps = {
  today: CalendarDate
  availability: Availability
  size?: TileSize
  className?: string
}

/** Sam pasek 14 kafli – dekoracja, niewidoczna dla czytników ekranu (opis niesie tekst obok). */
export function AvailabilityStrip({ today, availability, size = 'card', className }: StripProps) {
  const tiles = buildTiles(today, availability)
  const stagger = { '--tile-stagger': `${revealStaggerMs(availability)}ms` } as CSSProperties

  return (
    <div className={cx('flex flex-col gap-1.5', className)} aria-hidden="true">
      <TilesReveal
        className="tiles"
        data-size={size}
        data-state={availability.status}
        style={stagger}
      >
        {tiles.map((tile) => (
          <span
            key={tile.date}
            className="tile"
            data-tile={tile.kind}
            data-week-start={tile.weekStart ? '' : undefined}
            style={{ '--step': tile.revealStep } as CSSProperties}
          >
            {tile.kind === 'beyond' && <ArrowIcon />}
            {size === 'hero' && tile.kind === 'free' && (
              <span className="font-data text-small font-medium tabular-nums">
                {Number(tile.date.slice(8))}
              </span>
            )}
          </span>
        ))}
      </TilesReveal>
      {size === 'profile' && (
        <TileLabels today={today} size={size} label={(date) => formatWeekdayInitial(date)} />
      )}
      {size === 'hero' && (
        <TileLabels
          today={today}
          size={size}
          label={(date, index) => {
            if (index === 0) return 'dziś'
            if (availability.status === 'none' || availability.status === 'later') return null
            return date === availability.date ? formatShortDate(date) : null
          }}
        />
      )}
    </div>
  )
}

type LabelsProps = {
  today: CalendarDate
  size: TileSize
  label: (date: CalendarDate, index: number) => ReactNode
  className?: string
}

/** Wiersz podpisów wyrównany do kafli (te same odstępy i fugi tygodni). */
export function TileLabels({ today, size, label, className }: LabelsProps) {
  const tiles = buildTiles(today, { status: 'none' })
  return (
    <div className={cx('tiles-labels text-micro text-text-muted', className)} data-size={size}>
      {tiles.map((tile, index) => (
        <span key={tile.date} data-week-start={tile.weekStart ? '' : undefined}>
          {label(tile.date, index)}
        </span>
      ))}
    </div>
  )
}

type TilesProps = StripProps & {
  confirmedOn?: CalendarDate
}

/** Pasek z podpisem: „Wolny od 14 paź · potwierdzony wczoraj”. */
export function AvailabilityTiles({
  today,
  availability,
  confirmedOn,
  size,
  className,
}: TilesProps) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <AvailabilityStrip today={today} availability={availability} size={size} />
      <AvailabilityCaption today={today} availability={availability} confirmedOn={confirmedOn} />
    </div>
  )
}

type CaptionProps = {
  today: CalendarDate
  availability: Availability
  confirmedOn?: CalendarDate
  className?: string
}

export function AvailabilityCaption({ today, availability, confirmedOn, className }: CaptionProps) {
  const confirmed =
    availability.status !== 'none' && confirmedOn ? confirmedLabel(today, confirmedOn) : null

  return (
    <p className={cx('text-small', className)}>
      <span className="sr-only">{availabilityDescription(today, availability, confirmedOn)}</span>
      <span aria-hidden="true">
        {availability.status === 'none' ? (
          <span className="text-text-muted">{availabilityLabel(availability)}</span>
        ) : (
          <time dateTime={availability.date} className="font-medium">
            {availabilityLabel(availability)}
          </time>
        )}
        {confirmed && <span className="text-text-muted"> · {confirmed}</span>}
      </span>
    </p>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8h9m-3.5-3.5L12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
