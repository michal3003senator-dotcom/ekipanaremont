import type { Metadata } from 'next'
import Link from 'next/link'

import { idOf } from '@/access'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { publicContext } from '@/lib/search/context'
import { allServices } from '@/lib/search/options'

export const metadata: Metadata = {
  title: 'Usługi remontowe i budowlane – Ekipa na Termin',
  description:
    'Wszystkie rodzaje prac: remonty, wykończenia, instalacje, dachy, elewacje, ogrody. Firmy z województwa łódzkiego z najbliższym wolnym terminem.',
  alternates: { canonical: '/uslugi' },
}

/** Katalog usług: kategorie z zakresem prac – każda pozycja prowadzi do wyników wyszukiwania. */
export default async function ServicesPage() {
  const { payload } = await publicContext()
  const services = await allServices(payload)
  const main = services
    .filter((service) => !service.parent)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
  const childrenOf = (id: string) =>
    services
      .filter((service) => idOf(service.parent) === id)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'))

  return (
    <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-10 md:px-6 md:py-16">
      <header className="flex flex-col gap-3">
        <Breadcrumbs items={[{ label: 'Strona główna', href: '/' }, { label: 'Usługi' }]} />
        <h1 className="font-display text-h1 font-medium">Usługi remontowe i budowlane</h1>
        <p className="max-w-prose text-lead text-text-muted">
          {main.length} kategorii i {services.length - main.length} rodzajów prac. Wybierz, czego
          potrzebujesz – pokażemy firmy od najbliższego wolnego terminu.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {main.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4 md:p-6"
          >
            <h2 className="font-display text-lead font-semibold">
              <Link
                href={`/szukaj?usluga=${service.slug}`}
                className="hover:underline hover:underline-offset-4"
              >
                {service.name}
              </Link>
            </h2>
            <ul className="flex flex-wrap gap-2">
              {childrenOf(service.id).map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/szukaj?usluga=${service.slug}&zakres=${child.slug}`}
                    className="state-layer inline-flex min-h-9 items-center rounded-pill border border-line px-3 text-small"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
