import {
  AvailabilityStrip,
  AvailabilityTiles,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import {
  availabilityDescription,
  availabilityFrom,
  confirmedLabel,
  getAvailability,
} from '@/components/features/availability-tiles/model'
import { cx } from '@/lib/cx'
import type { CalendarDate } from '@/lib/format/date'
import { formatCount, formatRating, pluralNoun } from '@/lib/format/number'

import type { DemoFirm } from '../_data'
import { Photo } from './Photo'

type CardProps = { firm: DemoFirm; today: CalendarDate }

const cardClass =
  'group overflow-hidden rounded-card border border-line bg-surface-1 transition-colors duration-400 ease-standard hover:border-line-strong'

const area = (firm: DemoFirm) =>
  `${firm.locality} + ${formatCount(firm.areaExtra, { one: 'miejscowość', few: 'miejscowości', many: 'miejscowości' })}`

/** Ocena, liczba opinii i rejestr; liczby w kroju danych, żeby dało się je porównać w kolumnie. */
export function FirmFacts({ firm, className }: { firm: DemoFirm; className?: string }) {
  return (
    <p className={cx('text-small text-text-muted', className)}>
      <span className="font-data font-medium tabular-nums text-text">
        {formatRating(firm.rating)}
      </span>{' '}
      · <span className="font-data tabular-nums">{firm.reviews}</span>{' '}
      {pluralNoun(firm.reviews, { one: 'opinia', few: 'opinie', many: 'opinii' })} · W rejestrze{' '}
      {firm.registry}
    </p>
  )
}

/** A: pasek kafli przyklejony do zdjęcia, cała karta jest linkiem. */
export function FirmCardA({ firm, today }: CardProps) {
  const availability = getAvailability(today, firm.availableFrom)
  return (
    <a href={`/firma/${firm.slug}`} className={cx(cardClass, 'flex flex-col')}>
      <Photo
        photo={firm.photo}
        alt={firm.photoAlt}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        className="aspect-4/3"
      />
      <div className="border-t border-line px-4 pb-4 pt-3">
        <AvailabilityTiles
          today={today}
          availability={availability}
          confirmedOn={firm.confirmedOn}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-5">
        <h3 className="text-lead font-semibold">{firm.name}</h3>
        <p className="text-small text-text-muted">{firm.services}</p>
        <p className="text-small text-text-muted">{area(firm)}</p>
        <FirmFacts firm={firm} className="mt-auto pt-3" />
      </div>
    </a>
  )
}

/** B: karta pozioma od 768 px; paski kolejnych kart stoją w jednej kolumnie, jak w grafiku. */
export function FirmCardB({ firm, today }: CardProps) {
  const availability = getAvailability(today, firm.availableFrom)
  return (
    <a href={`/firma/${firm.slug}`} className={cx(cardClass, 'grid md:grid-cols-12')}>
      <Photo
        photo={firm.photo}
        alt={firm.photoAlt}
        sizes="(min-width: 768px) 25vw, 100vw"
        className="aspect-4/3 md:col-span-3"
      />
      <div className="flex flex-col gap-1 p-4 md:col-span-5 md:p-6">
        <h3 className="font-display text-h3 font-semibold">{firm.name}</h3>
        <p className="text-small text-text-muted">{firm.services}</p>
        <p className="text-small text-text-muted">{area(firm)}</p>
        <FirmFacts firm={firm} className="mt-auto pt-3" />
      </div>
      <div className="flex flex-col justify-center border-t border-line p-4 md:col-span-4 md:border-s md:border-t-0 md:p-6">
        <AvailabilityTiles
          today={today}
          availability={availability}
          confirmedOn={firm.confirmedOn}
        />
      </div>
    </a>
  )
}

/** C: tytułem karty jest termin, pod nim pasek, potem firma. */
export function FirmCardC({ firm, today }: CardProps) {
  const availability = getAvailability(today, firm.availableFrom)
  const from = availabilityFrom(availability)
  return (
    <a href={`/firma/${firm.slug}`} className={cx(cardClass, 'flex flex-col')}>
      <Photo
        photo={firm.photo}
        alt={firm.photoAlt}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        className="aspect-4/3"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="sr-only">{availabilityDescription(today, availability, firm.confirmedOn)}</p>
        <div aria-hidden="true">
          <p className={cx('font-display text-h2 font-semibold', !from && 'text-text-muted')}>
            {from ?? 'Zapytaj o termin'}
          </p>
          <AvailabilityStrip today={today} availability={availability} className="mt-3" />
          {from && firm.confirmedOn && (
            <p className="mt-2 text-small text-text-muted">
              {confirmedLabel(today, firm.confirmedOn)}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-1 border-t border-line pt-4">
          <h3 className="font-semibold">{firm.name}</h3>
          <p className="text-small text-text-muted">
            {firm.services} · {area(firm)}
          </p>
          <FirmFacts firm={firm} className="mt-auto pt-3" />
        </div>
      </div>
    </a>
  )
}
