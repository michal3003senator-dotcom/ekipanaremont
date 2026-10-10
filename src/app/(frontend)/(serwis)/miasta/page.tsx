import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { cityList, localityDescription } from '@/lib/localities'
import { publicContext } from '@/lib/search/context'

export const metadata: Metadata = {
  title: 'Miasta województwa łódzkiego – Ekipa na Termin',
  description:
    'Firmy remontowe z wolnym terminem w 60 miastach województwa łódzkiego i w dzielnicach Łodzi.',
  alternates: { canonical: '/miasta' },
}

/** Katalog miast (TERYT, prawa miejskie) i dzielnic Łodzi – każde prowadzi do wyników wyszukiwania. */
export default async function CitiesPage() {
  const { payload } = await publicContext()
  const all = await cityList(payload)
  const lodz = all.filter((place) => place.slug === 'lodz' || place.type === 'dzielnica')
  const towns = all.filter((place) => place.type !== 'dzielnica' && place.slug !== 'lodz')
  const byLetter = Map.groupBy(towns, (place) => place.name.charAt(0).toLocaleUpperCase('pl'))

  return (
    <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-10 md:px-6 md:py-16">
      <header className="flex flex-col gap-3">
        <Breadcrumbs items={[{ label: 'Strona główna', href: '/' }, { label: 'Miasta' }]} />
        <h1 className="font-display text-h1 font-medium">Miasta województwa łódzkiego</h1>
        <p className="max-w-prose text-lead text-text-muted">
          {towns.length + 1} miast i dzielnice Łodzi. Wybierz miasto, żeby zobaczyć firmy, które tam
          pracują – od najbliższego wolnego terminu. Wsie (ponad 4500) znajdziesz, wpisując nazwę w
          wyszukiwarce.
        </p>
      </header>

      <section aria-labelledby="lodz" className="flex flex-col gap-4">
        <h2 id="lodz" className="font-display text-h2 font-medium">
          Łódź
        </h2>
        <ul className="flex flex-wrap gap-2">
          {lodz.map((place) => (
            <li key={place.id}>
              <Link
                href={`/szukaj?gdzie=${place.slug}`}
                className="state-layer inline-flex h-11 items-center rounded-pill border border-line-strong px-4 text-small font-medium"
              >
                {place.type === 'dzielnica' ? `Łódź-${place.name}` : 'Cała Łódź'}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pozostale" className="flex flex-col gap-6">
        <h2 id="pozostale" className="font-display text-h2 font-medium">
          Pozostałe miasta
        </h2>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...byLetter].map(([letter, places]) => (
            <div key={letter} className="flex flex-col gap-2">
              <p
                aria-hidden="true"
                className="font-display text-lead font-semibold text-accent-soft"
              >
                {letter}
              </p>
              <ul className="flex flex-col gap-2">
                {places.map((place) => (
                  <li key={place.id}>
                    <Link
                      href={`/szukaj?gdzie=${place.slug}`}
                      className="group flex flex-col rounded-control py-1"
                    >
                      <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                        {place.name}
                      </span>
                      <span className="text-micro text-text-muted">
                        {localityDescription(place)?.replace(/^gm\. [^,]+, /, '')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
