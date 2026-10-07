import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { allCategories } from '@/lib/content/articles'
import { publicContext } from '@/lib/search/context'

import { ArticleList, pageFrom } from '../../ArticleList'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function categoryFor(params: Props['params']) {
  const { slug } = await params
  const { payload } = await publicContext()
  return (await allCategories(payload)).find((category) => category.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await categoryFor(params)
  if (!category) return { title: 'Nie znaleźliśmy kategorii – Ekipa na Termin' }
  return {
    title: `${category.seo?.title ?? category.name} – Poradnik – Ekipa na Termin`,
    description: category.seo?.description ?? category.description ?? undefined,
    alternates: { canonical: `/artykuly/kategoria/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await categoryFor(params)
  if (!category?.slug) notFound()
  return (
    <ArticleList
      title={category.name}
      lead={category.description ?? 'Poradniki z tej kategorii.'}
      category={{ id: category.id, slug: category.slug }}
      page={pageFrom((await searchParams).strona)}
      basePath={`/artykuly/kategoria/${category.slug}`}
    />
  )
}
