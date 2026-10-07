import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/features/content/ArticleCard'
import { RichContent } from '@/components/features/content/RichContent'
import { FirmCard } from '@/components/features/firm/FirmCard'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Pagination } from '@/components/ui/Pagination'
import { articlesForService } from '@/lib/content/articles'
import { formatCount } from '@/lib/format/number'
import { findLocalPage, type LocalPage } from '@/lib/local-pages'
import { searchHref } from '@/lib/search/href'
import { PAGE_SIZE, searchFirms } from '@/lib/search/firms'
import { publicContext } from '@/lib/search/context'
import { loadFirmSummaries } from '@/lib/search/summary'
import { serializeJsonLd } from '@/lib/seo/json-ld'

type Props = {
  params: Promise<{ slug: string; miejscowosc: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const pageFrom = (value: string | string[] | undefined) => {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page > 1 && page < 500 ? page : 1
}

async function localPageFor(params: Props['params']) {
  const { slug, miejscowosc } = await params
  const context = await publicContext()
  return { ...context, page: await findLocalPage(context.payload, slug, miejscowosc) }
}

async function introFor(
  payload: Awaited<ReturnType<typeof publicContext>>['payload'],
  page: LocalPage,
) {
  const { docs } = await payload.find({
    collection: 'localIntros',
    where: { service: { equals: page.service.id }, locality: { equals: page.locality.id } },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { payload, page } = await localPageFor(params)
  if (!page) return { title: 'Nie znaleźliśmy strony – Ekipa na Termin' }
  const intro = await introFor(payload, page)
  const title = `${page.service.name} – ${page.label}: firmy z wolnym terminem`
  return {
    title: `${intro?.seo?.title ?? title} – Ekipa na Termin`,
    description:
      intro?.seo?.description ??
      `${page.service.name}, ${page.label}: firmy remontowe od najbliższego wolnego terminu, z realizacjami i opiniami. Zapytanie bez opłat.`,
    alternates: { canonical: `/${page.service.slug}/${page.locality.slug}` },
    // Kolejne strony listy nie konkurują w wyszukiwarce z pierwszą.
    robots: pageFrom((await searchParams).strona) > 1 ? { index: false, follow: true } : undefined,
  }
}

/** Strona lokalna SEO (SPEC 3.14): wstęp z CMS, firmy od najbliższego terminu, powiązane artykuły. */
export default async function LocalServicePage({ params, searchParams }: Props) {
  const { payload, today, expiryDays, page } = await localPageFor(params)
  if (!page) notFound()
  const current = pageFrom((await searchParams).strona)
  const result = await searchFirms(payload, {
    today,
    expiryDays,
    page: current,
    serviceIds: page.serviceIds,
    localityId: page.locality.id,
  })
  // Bez aktywnej firmy strony nie ma (SPEC 3.14) – także w mapie strony.
  if (result.total === 0) notFound()
  const [firms, intro, articles] = await Promise.all([
    loadFirmSummaries(payload, result.ids, today, expiryDays),
    introFor(payload, page),
    articlesForService(payload, page.service.id),
  ])
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
  const basePath = `/${page.service.slug}/${page.locality.slug}`
  const site = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  const searchLink = searchHref(
    {},
    { usluga: page.service.slug ?? undefined, gdzie: page.locality.slug ?? undefined },
  )

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Firmy',
          item: new URL('/szukaj', site).toString(),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `${page.service.name} – ${page.label}`,
          item: new URL(basePath, site).toString(),
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: firms.map((firm, index) => ({
        '@type': 'ListItem',
        position: (current - 1) * PAGE_SIZE + index + 1,
        url: new URL(`/firma/${firm.slug}`, site).toString(),
        name: firm.name,
      })),
    },
  ]

  return (
    <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
      <script
        type="application/ld+json"
        // Bezpieczne: serializeJsonLd zamienia „<” na <, dane nie zamkną znacznika.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Firmy', href: '/szukaj' },
          {
            label: page.service.name,
            href: searchHref({}, { usluga: page.service.slug ?? undefined }),
          },
          { label: page.label },
        ]}
      />
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="font-display text-h1 font-medium text-balance">
          {page.service.name} – {page.label}
        </h1>
        <p className="text-lead text-text-muted text-pretty">
          {formatCount(result.total, { one: 'firma', few: 'firmy', many: 'firm' })} od najbliższego
          wolnego terminu. Porównaj realizacje i opinie, wyślij zapytanie bez opłat.
        </p>
        {intro?.intro && <RichContent data={intro.intro} className="mt-2" />}
      </header>
      <section aria-label="Firmy" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-h3 font-medium">Wolne terminy</h2>
          <Link
            href={searchLink}
            className="text-small text-accent-soft underline underline-offset-4"
          >
            Więcej filtrów
          </Link>
        </div>
        <ol className="results flex flex-col gap-4">
          {firms.map((firm, index) => (
            <li key={firm.slug} style={{ '--i': index } as React.CSSProperties}>
              <FirmCard firm={firm} today={today} />
            </li>
          ))}
        </ol>
        {totalPages > 1 && (
          <Pagination
            page={current}
            totalPages={totalPages}
            hrefFor={(next) => (next === 1 ? basePath : `${basePath}?strona=${next}`)}
          />
        )}
      </section>
      {articles.length > 0 && (
        <section aria-labelledby="poradniki" className="border-t border-line pt-10">
          <h2 id="poradniki" className="font-display text-h2 font-medium">
            Poradniki
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} heading="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
