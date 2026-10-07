import { SearchX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { FirmCard } from '@/components/features/firm/FirmCard'
import { Filters } from '@/components/features/search/Filters'
import { SearchForm } from '@/components/features/search/SearchForm'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/States'
import { formatCount } from '@/lib/format/number'
import { PAGE_SIZE, searchFirms } from '@/lib/search/firms'
import { allServices, resolveSearch, serviceOptions } from '@/lib/search/options'
import { parseSearchParams, searchHref } from '@/lib/search/params'
import { publicContext } from '@/lib/search/context'
import { loadFirmSummaries } from '@/lib/search/summary'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = parseSearchParams(await searchParams)
  const { payload } = await publicContext()
  const { service, locality } = await resolveSearch(payload, params)
  const title = [service?.name ?? 'Firmy remontowe', locality?.label].filter(Boolean).join(' – ')
  return {
    title: `${title} z wolnym terminem – Ekipa na Termin`,
    description: `${title}: firmy z województwa łódzkiego od najbliższego wolnego terminu. Realizacje, opinie i zapytanie bez opłat.`,
    // Wyniki z filtrami nie trafiają do indeksu – strony lokalne SEO powstaną w fazie 6.
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams)
  const { payload, today, expiryDays } = await publicContext()
  const [services, resolved] = await Promise.all([
    allServices(payload),
    resolveSearch(payload, params),
  ])
  const page = params.strona ?? 1
  const result = await searchFirms(payload, {
    today,
    expiryDays,
    page,
    serviceIds: resolved.serviceIds,
    localityId: resolved.localityId,
    radiusKm: params.promien ? Number(params.promien) : 0,
    withinDays: params.termin ? Number(params.termin) : undefined,
    vat: params.vat === '1',
    minRating: params.ocena === '1' ? 4.5 : undefined,
    warranty: params.gwarancja === '1',
  })
  const firms = await loadFirmSummaries(payload, result.ids, today, expiryDays)
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
  const heading = [resolved.service?.name ?? 'Firmy remontowe', resolved.locality?.label]
    .filter(Boolean)
    .join(', ')
  const activeCount =
    [params.termin, params.promien, params.vat, params.ocena, params.gwarancja].filter(Boolean)
      .length + (params.zakres?.length ?? 0)
  const serviceOption = resolved.service?.slug
    ? { value: resolved.service.slug, label: resolved.service.name }
    : null

  // Pusty wynik: jedna konkretna akcja, która poszerza wyszukiwanie (DESIGN §8).
  const widen =
    resolved.localityId && !params.promien
      ? { href: searchHref(params, { promien: '25' }), label: 'Szukam w promieniu 25 km' }
      : params.termin
        ? {
            href: searchHref(params, { termin: undefined }),
            label: 'Pokaż firmy z każdym terminem',
          }
        : { href: '/szukaj', label: 'Pokaż wszystkie firmy' }

  return (
    <div className="mx-auto max-w-page px-4 py-8 md:px-6 md:py-12">
      <SearchForm
        variant="bar"
        services={serviceOptions(services)}
        service={serviceOption}
        locality={resolved.locality}
        term={params.termin ?? ''}
        keep={params}
        className="mb-10 border-b border-line pb-8"
      />
      <div className="grid gap-8 lg:grid-cols-12">
        <aside aria-label="Filtry" className="lg:col-span-3">
          <Filters
            params={params}
            hasLocality={Boolean(resolved.localityId)}
            activeCount={activeCount}
            scope={resolved.children
              .filter((child) => child.slug)
              .map((child) => ({ value: child.slug!, label: child.name }))}
          />
        </aside>
        <section aria-labelledby="wyniki" className="flex flex-col gap-6 lg:col-span-9">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 id="wyniki" className="font-display text-h2 font-medium">
              {heading}
            </h1>
            <p className="text-small text-text-muted" aria-live="polite">
              {formatCount(result.total, { one: 'firma', few: 'firmy', many: 'firm' })} · od
              najbliższego terminu
            </p>
          </div>
          {firms.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Brak firm dla tych filtrów"
              description="Poszerz wyszukiwanie – firmy z sąsiednich miejscowości często dojeżdżają."
              action={
                <Button asChild variant="primary">
                  <Link href={widen.href}>{widen.label}</Link>
                </Button>
              }
            />
          ) : (
            <ol className="results flex flex-col gap-4">
              {firms.map((firm, index) => (
                <li key={firm.slug} style={{ '--i': index } as React.CSSProperties}>
                  <FirmCard firm={firm} today={today} />
                </li>
              ))}
            </ol>
          )}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(next) => searchHref(params, { strona: next })}
            />
          )}
        </section>
      </div>
    </div>
  )
}
