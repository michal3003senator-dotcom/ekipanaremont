import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { RenderBlocks } from '@/components/features/content/blocks/RenderBlocks'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { archivedVersion, getPage } from '@/lib/content/pages'
import { formatInstantDate } from '@/lib/format/date'
import { publicContext } from '@/lib/search/context'

type Props = { params: Promise<{ slug: string; id: string }> }

export const metadata: Metadata = {
  title: 'Archiwalna wersja dokumentu – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Treść archiwalnej wersji dokumentu prawnego – z wyraźną informacją, że nie obowiązuje. */
export default async function ArchivedVersionPage({ params }: Props) {
  const { slug, id } = await params
  if (!z.uuid().safeParse(id).success) notFound()
  const { payload } = await publicContext()
  const page = await getPage(payload, slug, { draft: false })
  if (!page?.legalKind) notFound()
  const version = await archivedVersion(payload, page, id)
  if (!version) notFound()

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6 md:py-16">
      <Breadcrumbs
        items={[
          { label: page.title, href: `/${page.slug}` },
          { label: 'Poprzednie wersje', href: `/${page.slug}/wersje` },
          { label: `Wersja ${version.legalVersion}` },
        ]}
      />
      <p className="rounded-control border border-line bg-surface-2 px-4 py-3 text-small">
        To archiwalna wersja {version.legalVersion}
        {version.effectiveFrom && ` (obowiązywała od ${formatInstantDate(version.effectiveFrom)})`}.
        Aktualna wersja jest na stronie „{page.title}”.
      </p>
      <h1 className="font-display text-h1 font-medium">{version.title}</h1>
      <RenderBlocks blocks={version.content} />
    </article>
  )
}
