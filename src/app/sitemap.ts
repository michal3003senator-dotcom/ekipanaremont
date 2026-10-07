import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

const site = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
const url = (path: string) => new URL(path, site).toString()

/** Odświeżana co godzinę (nowe profile bez ponownego wdrożenia). */
export const revalidate = 3600

/** Strona główna i aktywne profile firm (gość: reguła dostępu przepuszcza tylko `active`). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'firms',
    select: { slug: true, updatedAt: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    ...docs
      .filter((firm) => firm.slug)
      .map((firm) => ({
        url: url(`/firma/${firm.slug}`),
        lastModified: firm.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
  ]
}
