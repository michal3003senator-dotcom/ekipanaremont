import {
  AvailabilityCaption,
  AvailabilityStrip,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { type CalendarDate, formatMonth } from '@/lib/format/date'

import { HERO_FIRM, LOCALITIES, SERVICES } from '../_data'
import { PrimaryButton, SegmentedField, SelectField, START_OPTIONS } from './Fields'
import { Photo } from './Photo'

const serviceOptions = SERVICES.map((service) => ({ value: service.key, label: service.label }))
const localityOptions = LOCALITIES.map((locality) => ({
  value: locality.key,
  label: locality.label,
}))

/** A „Realizacja”: prawdziwa realizacja stoi na pasku kafli, obok wyszukiwarka. */
export function HeroA({ today }: { today: CalendarDate }) {
  const firm = HERO_FIRM
  const availability = getAvailability(today, firm.availableFrom)

  return (
    <section className="mx-auto max-w-page px-4 pb-14 pt-10 md:px-6 md:pb-24 md:pt-16">
      <div className="grid gap-x-6 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="font-display text-display font-semibold">
            Ekipy remontowe z wolnym terminem
          </h1>
          <p className="mt-4 max-w-prose text-lead text-text-muted">
            Firmy same wpisują i potwierdzają termin. Niepotwierdzony znika po 14 dniach.
          </p>
        </div>

        <form
          action="/szukaj"
          className="flex flex-col gap-5 rounded-card border border-line bg-surface-1 p-4 md:p-6 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-start"
        >
          <SelectField id="a-usluga" label="Usługa" name="usluga" options={serviceOptions} />
          <SelectField
            id="a-miejscowosc"
            label="Miejscowość"
            name="miejscowosc"
            options={localityOptions}
          />
          <SegmentedField legend="Start" name="termin" options={START_OPTIONS} defaultValue="14" />
          <PrimaryButton className="mt-1 w-full">Pokaż firmy</PrimaryButton>
        </form>

        <figure className="lg:col-span-8 lg:row-start-2">
          <div className="overflow-hidden rounded-card border border-line bg-surface-1">
            <Photo
              photo={firm.photo}
              alt={firm.photoAlt}
              sizes="(min-width: 1240px) 810px, (min-width: 1024px) 66vw, 100vw"
              eager
              className="aspect-4/3"
            />
            <div className="border-t border-line p-4 md:p-6">
              <AvailabilityStrip today={today} availability={availability} size="hero" />
              <AvailabilityCaption
                today={today}
                availability={availability}
                confirmedOn={firm.confirmedOn}
                className="mt-4"
              />
            </div>
          </div>
          <figcaption className="mt-3 text-small text-text-muted">
            {firm.project.title}, {firm.locality} · {formatMonth(firm.project.month)} ·{' '}
            <a
              href={`/firma/${firm.slug}`}
              className="text-accent-soft underline-offset-4 hover:underline"
            >
              {firm.name}
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
