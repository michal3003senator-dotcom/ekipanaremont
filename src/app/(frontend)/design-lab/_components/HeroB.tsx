import {
  AvailabilityCaption,
  AvailabilityStrip,
  TileLabels,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import type { CalendarDate } from '@/lib/format/date'
import { formatWeekdayInitial } from '@/lib/format/date'
import { formatRating } from '@/lib/format/number'

import { FIRMS, LOCALITIES, SERVICES } from '../_data'
import { PrimaryButton, SelectField } from './Fields'
import { Photo } from './Photo'

const serviceOptions = SERVICES.map((service) => ({ value: service.key, label: service.label }))
const localityOptions = LOCALITIES.map((locality) => ({
  value: locality.key,
  label: locality.label,
}))
const startOptions = [
  { value: 'obojetnie', label: 'obojętnie' },
  { value: '7', label: 'do 7 dni' },
  { value: '14', label: 'do 14 dni' },
  { value: '30', label: 'do 30 dni' },
]

const cell = 'p-4 md:p-5'

/** B „Grafik”: firmy na wspólnych kolumnach dni, jak grafik na budowie. */
export function HeroB({ today }: { today: CalendarDate }) {
  const rows = FIRMS.slice(0, 3)

  return (
    <section className="mx-auto max-w-page px-4 pb-14 pt-10 md:px-6 md:pb-24 md:pt-16">
      <h1 className="max-w-4xl font-display text-display font-semibold">
        Kto może zacząć remont najwcześniej?
      </h1>

      <form
        action="/szukaj"
        className="mt-8 grid divide-y divide-line rounded-card border border-line bg-surface-1 md:grid-cols-4 md:divide-x md:divide-y-0"
      >
        <SelectField
          id="b-usluga"
          label="Usługa"
          name="usluga"
          options={serviceOptions}
          className={cell}
        />
        <SelectField
          id="b-miejscowosc"
          label="Miejscowość"
          name="miejscowosc"
          options={localityOptions}
          className={cell}
        />
        <SelectField
          id="b-termin"
          label="Start"
          name="termin"
          options={startOptions}
          defaultValue="14"
          className={cell}
        />
        <div className={`${cell} flex items-end`}>
          <PrimaryButton className="w-full">Pokaż firmy</PrimaryButton>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface-1">
        <div
          className="hidden border-b border-line px-6 py-3 text-micro uppercase tracking-caps text-text-muted lg:grid lg:grid-cols-12 lg:gap-x-6"
          aria-hidden="true"
        >
          <span className="col-span-4">Firma</span>
          <TileLabels
            today={today}
            size="card"
            className="col-span-6 normal-case tracking-normal"
            label={(date, index) =>
              index === 0 ? 'dziś' : `${formatWeekdayInitial(date)} ${Number(date.slice(8))}`
            }
          />
          <span className="col-span-2">Termin</span>
        </div>
        <ol className="divide-y divide-line">
          {rows.map((firm) => {
            const availability = getAvailability(today, firm.availableFrom)
            return (
              <li
                key={firm.slug}
                className="grid gap-4 p-4 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:px-6"
              >
                <a
                  href={`/firma/${firm.slug}`}
                  className="group flex items-center gap-4 lg:col-span-4"
                >
                  <Photo
                    photo={firm.photo}
                    alt={firm.photoAlt}
                    sizes="96px"
                    label={false}
                    className="aspect-4/3 w-24 shrink-0 rounded-badge"
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold">{firm.name}</span>
                    <span className="text-small text-text-muted">
                      {firm.locality} ·{' '}
                      <span className="font-data tabular-nums">
                        {formatRating(firm.rating)} ({firm.reviews})
                      </span>
                    </span>
                  </span>
                </a>
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
      <p className="mt-4 text-small text-text-muted">
        Termin wpisuje i potwierdza firma. Niepotwierdzony znika po 14 dniach. Miniatury to zdjęcia
        poglądowe.
      </p>
    </section>
  )
}
