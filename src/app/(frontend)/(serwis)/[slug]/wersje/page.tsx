import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { getPage, legalArchive } from '@/lib/content/pages'
import { formatInstantDate } from '@/lib/format/date'
import { publicContext } from '@/lib/search/context'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Poprzednie wersje dokumentu – Ekipa na Termin',
  robots: { index: false, follow: true },
}

/** Archiwum wersji dokumentu prawnego (SPEC 3.8). */
export default async function LegalArchivePage({ params }: Props) {
  const { slug } = await params
  const { payload } = await publicContext()
  const page = await getPage(payload, slug, { draft: false })
  if (!page?.legalKind) notFound()
  const archive = await legalArchive(payload, page)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6 md:py-16">
      <Breadcrumbs
        items={[{ label: page.title, href: `/${page.slug}` }, { label: 'Poprzednie wersje' }]}
      />
      <h1 className="font-display text-h1 font-medium">{page.title}: poprzednie wersje</h1>
      {archive.length === 0 ? (
        <p className="text-body text-text-muted">To pierwsza wersja dokumentu.</p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {archive.map((version) => (
            <li key={version.id} className="border-b border-line">
              <Link
                href={`/${page.slug}/wersje/${version.id}`}
                className="flex min-h-14 items-center justify-between gap-4 py-3"
              >
                <span className="font-medium">Wersja {version.legalVersion}</span>
                <span className="font-data text-small text-text-muted">
                  {version.effectiveFrom
                    ? `obowiązywała od ${formatInstantDate(version.effectiveFrom)}`
                    : formatInstantDate(version.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
