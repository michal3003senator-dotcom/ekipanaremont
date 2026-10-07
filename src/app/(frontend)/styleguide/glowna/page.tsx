import Image from 'next/image'
import Link from 'next/link'

import { AvailabilityStrip } from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { FirmBoard } from '@/components/features/firm/FirmBoard'
import { FirmCard } from '@/components/features/firm/FirmCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { formatMonth } from '@/lib/format/date'

import { DEMO_TODAY, FIRMS, LOCALITIES, PROJECTS } from '../_data'

const SERVICES = [
  { value: 'lazienka', label: 'Remont łazienki' },
  { value: 'plytki', label: 'Układanie płytek' },
  { value: 'malowanie', label: 'Malowanie i gładzie' },
  { value: 'kuchnia', label: 'Remont kuchni' },
]
const START = [
  { value: '7', label: 'w ciągu 7 dni' },
  { value: '14', label: 'w ciągu 14 dni' },
  { value: '30', label: 'w ciągu 30 dni' },
  { value: 'obojetnie', label: 'obojętnie kiedy' },
]
const labelClass = 'text-micro font-medium uppercase tracking-caps text-text-muted'

/** Prototyp strony głównej (faza 5) na komponentach z fazy 2b – do oceny kierunku na pełnym ekranie. */
export default function HomePrototypePage() {
  const feature = FIRMS[1]
  const project = PROJECTS[0]
  if (!feature || !project) return null

  return (
    <div className="-mx-4 md:-mx-6">
      {/* Teza: kto może zacząć najwcześniej – wyszukiwarka i grafik od razu, bez stockowego hero. */}
      <section className="px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
        <p className={labelClass}>Firmy remontowe · województwo łódzkie</p>
        <h1 className="mt-4 max-w-5xl font-display text-display font-medium">
          Kto może zacząć remont najwcześniej?
        </h1>
        <p className="mt-5 max-w-2xl text-lead text-text-muted">
          Każda firma sama wpisuje najbliższy wolny termin i potwierdza go co dwa tygodnie.
          Niepotwierdzony znika z wyników.
        </p>

        <form
          action="/styleguide/glowna"
          className="mt-10 grid divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-1 inset-shadow-edge md:grid-cols-12 md:divide-x md:divide-y-0"
        >
          <label className="flex flex-col gap-2 p-4 md:col-span-4 md:p-5">
            <span className={labelClass}>Usługa</span>
            <Select name="usluga" options={SERVICES} defaultValue="lazienka" />
          </label>
          <label className="flex flex-col gap-2 p-4 md:col-span-3 md:p-5">
            <span className={labelClass}>Miejscowość</span>
            <Select name="miejscowosc" options={LOCALITIES} defaultValue="lodz" />
          </label>
          <label className="flex flex-col gap-2 p-4 md:col-span-3 md:p-5">
            <span className={labelClass}>Start</span>
            <Select name="termin" options={START} defaultValue="14" />
          </label>
          <div className="flex items-end p-4 md:col-span-2 md:p-5">
            <Button type="submit" variant="primary" className="w-full">
              Pokaż firmy
            </Button>
          </div>
        </form>

        <FirmBoard firms={FIRMS.slice(0, 3)} today={DEMO_TODAY} className="mt-6" />
        <p className="mt-3 text-small text-text-muted">
          Najbliższe 2 tygodnie od dziś. Fiolet to pierwszy wolny dzień firmy.
        </p>
      </section>

      {/* Realizacja na całą szerokość: zdjęcie jest główną treścią (DESIGN §7). */}
      <section aria-labelledby="realizacja" className="relative">
        <div className="photo-frame relative aspect-4/3 overflow-hidden md:aspect-21/9">
          <Image
            src={project.photo.src}
            alt={project.photo.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
          <span className="absolute end-4 top-4 rounded-badge bg-scrim px-2 py-1 text-micro text-on-scrim md:end-6">
            zdjęcie poglądowe
          </span>
        </div>
        <div className="relative mx-4 -mt-20 rounded-card border border-line bg-surface-1 p-5 inset-shadow-edge md:absolute md:bottom-8 md:start-6 md:mx-0 md:mt-0 md:w-md md:p-6">
          <p className={labelClass}>Realizacja · {formatMonth(project.month)}</p>
          <h2 id="realizacja" className="mt-2 font-display text-h2 font-medium">
            {project.title}, {project.locality}
          </h2>
          <p className="mt-1 text-small text-text-muted">{feature.name}</p>
          <AvailabilityStrip
            today={DEMO_TODAY}
            availability={getAvailability(DEMO_TODAY, feature.availableFrom)}
            className="mt-5"
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-small">
              <span className="font-medium">Wolny od 14 paź</span>{' '}
              <span className="text-text-muted">· potwierdzony wczoraj</span>
            </p>
            <Link
              href={`/styleguide/przejscie/${feature.slug}`}
              className="shrink-0 text-small font-medium text-accent-soft underline-offset-4 hover:underline"
            >
              Zobacz firmę
            </Link>
          </div>
        </div>
      </section>

      {/* Wyniki: najbliższy termin najpierw, paski w jednej kolumnie. */}
      <section aria-labelledby="wyniki" className="px-4 pb-24 pt-20 md:px-6 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={labelClass}>Remont łazienki · Łódź i okolice</p>
            <h2 id="wyniki" className="mt-3 font-display text-h1 font-medium">
              Wolne terminy w tym miesiącu
            </h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/styleguide/przejscie">Wszystkie firmy</Link>
          </Button>
        </div>
        <ul className="mt-10 flex flex-col gap-4">
          {FIRMS.map((firm) => (
            <li key={firm.slug}>
              <FirmCard
                firm={firm}
                today={DEMO_TODAY}
                href={`/styleguide/przejscie/${firm.slug}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
