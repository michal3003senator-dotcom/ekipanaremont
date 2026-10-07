import type { Payload, Where } from 'payload'
import { cache } from 'react'

import type { Article, ArticleCategory } from '@/payload-types'

export const ARTICLES_PAGE_SIZE = 12

const published: Where = { _status: { equals: 'published' } }

/** Kto czyta: gość (tylko opublikowane) albo personel w trybie podglądu (szkic, ADR 0023). */
export type ContentReader = { draft: boolean; user?: unknown }

const access = ({ draft, user }: ContentReader) =>
  draft
    ? ({ draft: true, overrideAccess: false, user } as const)
    : ({ overrideAccess: false } as const)

/** Artykuł po adresie; `cache` – jedno zapytanie dla metadanych i strony. */
export const getArticle = cache(
  async (payload: Payload, slug: string, reader: ContentReader): Promise<Article | null> => {
    const { docs } = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...access(reader),
    })
    return docs[0] ?? null
  },
)

export async function listArticles(
  payload: Payload,
  {
    category,
    page = 1,
    limit = ARTICLES_PAGE_SIZE,
  }: { category?: string; page?: number; limit?: number },
) {
  return payload.find({
    collection: 'articles',
    where: category ? { and: [published, { category: { equals: category } }] } : published,
    sort: '-publishedAt',
    depth: 1,
    page,
    limit,
    overrideAccess: false,
  })
}

/** Inne artykuły z tej samej kategorii (albo najnowsze), bez bieżącego. */
export async function relatedArticles(payload: Payload, article: Article, limit = 3) {
  const category = typeof article.category === 'object' ? article.category?.id : article.category
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      and: [
        published,
        { id: { not_equals: article.id } },
        ...(category ? [{ category: { equals: category } }] : []),
      ],
    },
    sort: '-publishedAt',
    depth: 1,
    limit,
    overrideAccess: false,
  })
  return docs
}

/** Artykuły powiązane z usługą – na stronach lokalnych (SPEC 3.14). */
export async function articlesForService(payload: Payload, serviceId: string, limit = 3) {
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [published, { relatedServices: { contains: serviceId } }] },
    sort: '-publishedAt',
    depth: 1,
    limit,
    overrideAccess: false,
  })
  return docs
}

export const allCategories = cache(async (payload: Payload): Promise<ArticleCategory[]> => {
  const { docs } = await payload.find({
    collection: 'articleCategories',
    sort: 'name',
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs
})

/** Pytania z bloków FAQ – do danych strukturalnych FAQPage. */
export function faqItems(article: Pick<Article, 'content'>) {
  return (article.content ?? []).flatMap((block) =>
    block.blockType === 'faq' ? (block.items ?? []) : [],
  )
}
