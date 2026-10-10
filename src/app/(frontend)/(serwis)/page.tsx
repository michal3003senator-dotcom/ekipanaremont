import type { Metadata } from 'next'
import Link from 'next/link'

import { FirmCard } from '@/components/features/firm/FirmCard'
import { SearchForm } from '@/components/features/search/SearchForm'
import { Button } from '@/components/ui/Button'
import { searchFirms } from '@/lib/search/firms'
import { cityList, cityOptions } from '@/lib/localities'
import { allServices, serviceOptions } from '@/lib/search/options'
import { publicContext } from '@/lib/search/context'
import { loadFirmSummaries } from '@/lib/search/summary'

export const metadata: Metadata = {
  title: 'Ekipa na Termin – firmy remontowe z wolnym terminem, województwo łódzkie',
  description:
    'Znajdź firmę remontową z Łodzi i okolic, która ma wolny termin. Porównaj najbliższe terminy, realizacje i opinie, wyślij zapytanie bez opłat.',
  alternates: { canonical: '/' },
}

/** Skróty do częstych wyszukiwań – tylko istniejące usługi i miejscowości. */
const QUICK = [
  { usluga: 'remont-lazienki', gdzie: 'lodz', label: 'Remont łazienki, Łódź' },
  { usluga: 'glazurnik', gdzie: 'lodz', label: 'Glazurnik, Łódź' },
  { usluga: 'malarz', gdzie: 'zgierz', label: 'Malarz, Zgierz' },
  { usluga: 'hydraulik', gdzie: 'pabianice', label: 'Hydraulik, Pabianice' },
] as const

const STEPS = [
  { title: 'Wpisz, czego szukasz', text: 'Usługa i miejscowość – podpowiadamy nawet z literówką.' },
  {
    title: 'Porównaj terminy',
    text: 'Kafle pokazują najbliższe 2 tygodnie: fioletowy to dzień, od którego firma może zacząć.',
  },
  {
    title: 'Wyślij zapytanie',
    text: 'Bez rejestracji i opłat. Firma odpowie telefonicznie albo e-mailem.',
  },
] as const

export default async function HomePage() {
  const { payload, today, expiryDays } = await publicContext()
  const [services, cities, nearest] = await Promise.all([
    allServices(payload),
    cityList(payload),
    searchFirms(payload, { today, expiryDays, withinDays: 30, limit: 6 }),
  ])
  const firms = await loadFirmSummaries(payload, nearest.ids, today, expiryDays)

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto flex max-w-page flex-col gap-8 px-4 pt-14 pb-12 md:px-6 md:pt-24 md:pb-16">
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="font-display text-display font-medium text-balance">
              Fachowiec z <span className="text-accent-soft">wolnym terminem</span>, nie za pół
              roku.
            </h1>
            <p className="max-w-2xl text-lead text-text-muted text-pretty">
              Firmy remontowe z województwa łódzkiego pokazują najbliższy dzień, w którym mogą
              zacząć. Porównaj i napisz do tych, które mają czas.
            </p>
          </div>
          <SearchForm services={serviceOptions(services)} cities={cityOptions(cities)} />
          <nav aria-label="Często szukane" className="flex flex-wrap items-center gap-2 text-small">
            <span className="text-text-muted">Często szukane:</span>
            {QUICK.map((item) => (
              <Link
                key={item.label}
                href={`/szukaj?usluga=${item.usluga}&gdzie=${item.gdzie}`}
                className="flex min-h-11 items-center rounded-control border border-line bg-surface-1 px-3 transition-colors duration-150 hover:border-line-strong"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section
        aria-labelledby="najblizsze"
        className="mx-auto flex max-w-page flex-col gap-6 px-4 py-14 md:px-6 md:py-24"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="najblizsze" className="font-display text-h2 font-medium">
            Najbliższe wolne terminy
          </h2>
          <Link
            href="/szukaj?termin=30"
            className="text-small text-accent-soft underline underline-offset-4"
          >
            Wszystkie firmy z terminem
          </Link>
        </div>
        {firms.length ? (
          <ul className="flex flex-col gap-4">
            {firms.map((firm) => (
              <li key={firm.slug}>
                <FirmCard firm={firm} today={today} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-prose text-body text-text-muted">
            Firmy dopiero potwierdzają terminy. Wyszukaj usługę – pokażemy wszystkie firmy z Twojej
            okolicy.
          </p>
        )}
      </section>

      <section aria-labelledby="jak" className="border-y border-line bg-surface-1">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-14 md:grid-cols-12 md:px-6 md:py-24">
          <h2 id="jak" className="font-display text-h2 font-medium md:col-span-4">
            Jak to działa
          </h2>
          <ol className="grid gap-6 md:col-span-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2 border-t border-line pt-4">
                <span className="font-data text-small text-text-muted tabular-nums">
                  {index + 1}
                </span>
                <h3 className="text-lead font-medium">{step.title}</h3>
                <p className="text-small text-text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-page flex-col items-start gap-4 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-6 md:py-20">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-h3 font-medium">Prowadzisz firmę remontową?</h2>
          <p className="text-body text-text-muted">
            Pokaż wolny termin klientom z okolicy. Pierwsze 30 dni bez opłat.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/rejestracja">Zakładam konto firmy</Link>
        </Button>
      </section>
    </>
  )
}
