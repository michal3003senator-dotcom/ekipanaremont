import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload, type Payload } from 'payload'

import { calculatorsEnabled } from '@/lib/content/calculators'
import { contentPath } from '@/lib/content/paths'
import { localPagePairs } from '@/lib/local-pages'

const site = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
const url = (path: string) => new URL(path, site).toString()

/** Odświeżana co godzinę (nowe profile i treści bez ponownego wdrożenia). */
export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

/** Opublikowane dokumenty kolekcji (gość widzi tylko opublikowane). */
async function published(
  payload: Payload,
  collection: 'articles' | 'articleCategories' | 'calculators' | 'pages',
  priority: number,
): Promise<Entry[]> {
  const { docs } = await payload.find({
    collection,
    select: { slug: true, updatedAt: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs.flatMap((doc) => {
    const path = contentPath(collection, doc.slug)
    return path ? [{ url: url(path), lastModified: doc.updatedAt, priority }] : []
  })
}

/**
 * Mapa strony: główna, aktywne profile, strony lokalne z co najmniej 1 aktywną firmą (SPEC 3.14),
 * poradnik, kalkulatory (gdy moduł włączony) i strony z CMS.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [firms, pairs, articles, categories, calculators, pages] = await Promise.all([
    payload.find({
      collection: 'firms',
      select: { slug: true, updatedAt: true },
      depth: 0,
      pagination: false,
      overrideAccess: false,
    }),
    localPagePairs(payload),
    published(payload, 'articles', 0.6),
    published(payload, 'articleCategories', 0.4),
    calculatorsEnabled().then((enabled) => (enabled ? published(payload, 'calculators', 0.5) : [])),
    published(payload, 'pages', 0.3),
  ])
  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url('/uslugi'), priority: 0.6 },
    { url: url('/miasta'), priority: 0.6 },
    ...pairs.map((pair) => ({
      url: url(`/${pair.service}/${pair.locality}`),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...firms.docs
      .filter((firm) => firm.slug)
      .map((firm) => ({
        url: url(`/firma/${firm.slug}`),
        lastModified: firm.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ...(articles.length ? [{ url: url('/artykuly'), priority: 0.5 }] : []),
    ...articles,
    ...categories,
    ...(calculators.length ? [{ url: url('/kalkulatory'), priority: 0.5 }] : []),
    ...calculators,
    ...pages,
  ]
}
