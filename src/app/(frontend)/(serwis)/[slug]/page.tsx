import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/features/content/blocks/RenderBlocks'
import { PreviewBar } from '@/components/features/content/PreviewBar'
import { legalArchive, getPage } from '@/lib/content/pages'
import { contentReader } from '@/lib/content/preview'
import { formatInstantDate } from '@/lib/format/date'
import { publicContext } from '@/lib/search/context'

type Props = { params: Promise<{ slug: string }> }

async function pageFor(params: Props['params']) {
  const { slug } = await params
  const [{ payload }, reader] = await Promise.all([publicContext(), contentReader()])
  return { payload, reader, page: await getPage(payload, slug, reader) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await pageFor(params)
  if (!page) return { title: 'Nie znaleźliśmy strony – Ekipa na Termin' }
  return {
    title: `${page.seo?.title ?? page.title} – Ekipa na Termin`,
    description: page.seo?.description ?? undefined,
    alternates: { canonical: page.seo?.canonical ?? `/${page.slug}` },
  }
}

/** Strona z CMS (SPEC 3.8): regulamin, polityki, O nas, Kontakt i inne. Dokument prawny z wersją. */
export default async function CmsPage({ params }: Props) {
  const { payload, reader, page } = await pageFor(params)
  if (!page) notFound()
  const archive = page.legalKind ? await legalArchive(payload, page) : []

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6 md:py-16">
      {reader.draft && <PreviewBar path={`/${page.slug}`} />}
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-h1 font-medium text-balance">{page.title}</h1>
        {page.legalKind && page.legalVersion && (
          <p className="font-data text-small text-text-muted">
            Wersja {page.legalVersion}
            {page.effectiveFrom && `, obowiązuje od ${formatInstantDate(page.effectiveFrom)}`}
            {archive.length > 0 && (
              <>
                {' · '}
                <Link
                  href={`/${page.slug}/wersje`}
                  className="whitespace-nowrap underline underline-offset-4"
                >
                  Poprzednie wersje
                </Link>
              </>
            )}
          </p>
        )}
      </header>
      <RenderBlocks blocks={page.content} />
    </article>
  )
}
