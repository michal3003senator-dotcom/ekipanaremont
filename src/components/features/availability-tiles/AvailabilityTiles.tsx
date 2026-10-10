import type { CSSProperties, ReactNode } from 'react'

import { cn } from '../../../lib/cn'
import { type CalendarDate, formatWeekdayInitial } from '../../../lib/format/date'
import {
  type Availability,
  availabilityDescription,
  availabilityLabel,
  availabilitySummary,
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

/**
 * Pasek 14 dni od dziś z numerami dni – dekoracja, niewidoczna dla czytników ekranu (opis niesie
 * tekst obok). Dziś ma obwódkę; nad paskiem (profil, grafik) inicjały dni tygodnia.
 */
export function AvailabilityStrip({ today, availability, size = 'card', className }: StripProps) {
  const tiles = buildTiles(today, availability)
  const stagger = { '--tile-stagger': `${revealStaggerMs(availability)}ms` } as CSSProperties

  return (
    <div className={cn('flex flex-col gap-1', className)} aria-hidden="true">
      {size !== 'card' && (
        <TileLabels today={today} size={size} label={(date) => formatWeekdayInitial(date)} />
      )}
      <TilesReveal
        className="tiles"
        data-size={size}
        data-state={availability.status}
        style={stagger}
      >
        {tiles.map((tile, index) => (
          <span
            key={tile.date}
            className="tile"
            data-tile={tile.kind}
            data-today={index === 0 ? '' : undefined}
            data-week-start={tile.weekStart ? '' : undefined}
            // Numer dnia z CSS (::before): pasek jest dekoracją, termin opisuje tekst obok.
            data-day={tile.kind === 'beyond' ? undefined : Number(tile.date.slice(8))}
            style={{ '--step': tile.revealStep } as CSSProperties}
          >
            {tile.kind === 'beyond' && <ArrowIcon />}
          </span>
        ))}
      </TilesReveal>
    </div>
  )
}

/** Legenda kolorów paska – raz nad listą wyników i w profilu. */
export function AvailabilityLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-micro text-text-muted', className)}>
      <li className="flex items-center gap-1.5">
        <span className="tile-swatch" data-tile="taken" aria-hidden="true" />
        zajęte
      </li>
      <li className="flex items-center gap-1.5">
        <span className="tile-swatch" data-tile="free" aria-hidden="true" />
        najbliższy wolny dzień
      </li>
      <li className="flex items-center gap-1.5">
        <span className="tile-swatch" data-tile="open" aria-hidden="true" />
        kolejne dni – do uzgodnienia
      </li>
      <li className="flex items-center gap-1.5">
        <span className="tile-swatch" data-today="" aria-hidden="true" />
        dziś
      </li>
    </ul>
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
    <div className={cn('tiles-labels text-micro text-text-muted', className)} data-size={size}>
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

/** Kafel terminu na karcie: „Najbliższy wolny termin”, data z odstępem, pasek, potwierdzenie. */
export function AvailabilityTiles({
  today,
  availability,
  confirmedOn,
  size,
  className,
}: TilesProps) {
  const { date, distance } = availabilitySummary(availability)
  const confirmed =
    availability.status !== 'none' && confirmedOn ? confirmedLabel(today, confirmedOn) : null
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="sr-only">{availabilityDescription(today, availability, confirmedOn)}</p>
      <div aria-hidden="true" className="flex flex-col gap-0.5">
        <span className="text-micro uppercase tracking-caps text-text-muted">
          Najbliższy wolny termin
        </span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          {availability.status === 'none' ? (
            <span className="font-medium text-text-muted">Do uzgodnienia</span>
          ) : (
            <time dateTime={availability.date} className="text-lead font-semibold">
              {date}
            </time>
          )}
          {distance && <span className="text-small text-text-muted">{distance}</span>}
        </span>
      </div>
      <AvailabilityStrip today={today} availability={availability} size={size} />
      {confirmed && (
        <span aria-hidden="true" className="text-micro text-text-muted">
          Termin {confirmed}
        </span>
      )}
    </div>
  )
}

type CaptionProps = {
  today: CalendarDate
  availability: Availability
  confirmedOn?: CalendarDate
  /** Potwierdzenie w osobnej linii, bez kropki – do wąskich kolumn. */
  stacked?: boolean
  className?: string
}

export function AvailabilityCaption(props: CaptionProps) {
  const { today, availability, confirmedOn, stacked, className } = props
  const confirmed =
    availability.status !== 'none' && confirmedOn ? confirmedLabel(today, confirmedOn) : null

  return (
    <p className={cn('text-small', className)}>
      <span className="sr-only">{availabilityDescription(today, availability, confirmedOn)}</span>
      <span aria-hidden="true">
        {availability.status === 'none' ? (
          <span className="text-text-muted">{availabilityLabel(availability)}</span>
        ) : (
          <time dateTime={availability.date} className="font-medium">
            {availabilityLabel(availability)}
          </time>
        )}
        {confirmed && (
          <span className={cn('text-text-muted', stacked && 'block')}>
            {stacked ? confirmed : ` · ${confirmed}`}
          </span>
        )}
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
