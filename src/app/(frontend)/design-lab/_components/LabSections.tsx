import { AvailabilityTiles } from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import type { CalendarDate } from '@/lib/format/date'
import { formatCount, formatPrice } from '@/lib/format/number'

import { FIRMS, VARIANTS, type VariantKey } from '../_data'
import { FirmCardA, FirmCardB, FirmCardC } from './FirmCards'

const section = 'border-t border-line'
const inner = 'mx-auto max-w-page px-4 py-14 md:px-6 md:py-24'

export function ResultsSection({ variant, today }: { variant: VariantKey; today: CalendarDate }) {
  const Card = { a: FirmCardA, b: FirmCardB, c: FirmCardC }[variant]
  return (
    <section className={section} aria-labelledby="wyniki">
      <div className={inner}>
        <h2 id="wyniki" className="font-display text-h2 font-semibold">
          Remont łazienki · Zgierz
        </h2>
        <p className="mt-2 text-small text-text-muted">
          {formatCount(FIRMS.length, { one: 'firma', few: 'firmy', many: 'firm' })}, najbliższy
          termin najpierw
        </p>
        <ul
          className={
            variant === 'b'
              ? 'mt-8 flex flex-col gap-4'
              : 'mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {FIRMS.map((firm) => (
            <li key={firm.slug} className="flex">
              <Card firm={firm} today={today} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const STATES: Array<{
  title: string
  availableFrom: CalendarDate | null
  confirmedOn?: CalendarDate
}> = [
  { title: 'Termin w ciągu 14 dni', availableFrom: '2026-10-14', confirmedOn: '2026-10-06' },
  { title: 'Wolny od dziś', availableFrom: '2026-10-07', confirmedOn: '2026-10-07' },
  { title: 'Termin dalej niż 14 dni', availableFrom: '2026-11-03', confirmedOn: '2026-10-04' },
  { title: 'Brak potwierdzonego terminu', availableFrom: null },
]

export function TileStatesSection({ today }: { today: CalendarDate }) {
  return (
    <section className={section} aria-labelledby="kafel">
      <div className={inner}>
        <h2 id="kafel" className="font-display text-h2 font-semibold">
          Kafel terminu
        </h2>
        <p className="mt-2 max-w-prose text-small text-text-muted">
          Cztery stany w rozmiarze z profilu. Kafle zapalają się raz, po wejściu w ekran; przy
          ograniczonym ruchu od razu widać stan końcowy.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {STATES.map((state) => (
            <li
              key={state.title}
              className="rounded-card border border-line bg-surface-1 p-4 md:p-6"
            >
              <h3 className="text-micro font-medium uppercase tracking-caps text-text-muted">
                {state.title}
              </h3>
              <AvailabilityTiles
                today={today}
                availability={getAvailability(today, state.availableFrom)}
                confirmedOn={state.confirmedOn}
                size="profile"
                className="mt-4"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const SPECIMEN = `Zażółć gęślą jaźń. Wolny od 14 października, ${formatPrice(125_000)}`

export function SpecimenSection({ set }: { set: VariantKey }) {
  return (
    <section className={section} aria-labelledby="kroje">
      <div className={inner}>
        <h2 id="kroje" className="text-micro font-medium uppercase tracking-caps text-text-muted">
          Kroje: {VARIANTS[set].fonts}
        </h2>
        <p className="mt-6 font-display text-h1 font-semibold">{SPECIMEN}</p>
        <p className="mt-4 text-lead">{SPECIMEN}</p>
        <p className="mt-4 font-data tabular-nums">{SPECIMEN}</p>
      </div>
    </section>
  )
}
