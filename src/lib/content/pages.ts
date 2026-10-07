import type { Payload } from 'payload'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import type { ContentReader } from './articles'

/** Strona z CMS po adresie (opublikowana albo szkic w podglądzie redakcji). */
export const getPage = cache(
  async (payload: Payload, slug: string, reader: ContentReader): Promise<Page | null> => {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...(reader.draft
        ? { draft: true, overrideAccess: false, user: reader.user }
        : { overrideAccess: false }),
    })
    return docs[0] ?? null
  },
)

/** Adresy opublikowanych stron – stopka linkuje tylko do nich (bez linków do 404). */
export const publishedPageSlugs = cache(async (payload: Payload): Promise<Set<string>> => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    select: { slug: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return new Set(docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug)))
})

export type LegalVersion = {
  id: string
  legalVersion: string
  effectiveFrom: string | null
  publishedAt: string
}

/**
 * Archiwum dokumentu prawnego (SPEC 3.8): opublikowane wersje z innym numerem niż bieżący,
 * od najnowszej. Wersje opublikowane są publiczne, więc czytamy je systemowo.
 */
export async function legalArchive(payload: Payload, page: Page): Promise<LegalVersion[]> {
  if (!page.legalKind) return []
  const { docs } = await payload.findVersions({
    collection: 'pages',
    where: {
      parent: { equals: page.id },
      'version._status': { equals: 'published' },
    },
    sort: '-updatedAt',
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })
  const seen = new Set([page.legalVersion])
  const archive: LegalVersion[] = []
  for (const doc of docs) {
    const version = doc.version.legalVersion
    if (!version || seen.has(version)) continue
    seen.add(version)
    archive.push({
      id: doc.id,
      legalVersion: version,
      effectiveFrom: doc.version.effectiveFrom ?? null,
      publishedAt: doc.updatedAt,
    })
  }
  return archive
}

/** Jedna opublikowana wersja z archiwum (tylko tej strony). */
export async function archivedVersion(payload: Payload, page: Page, versionId: string) {
  const { docs } = await payload.findVersions({
    collection: 'pages',
    where: {
      id: { equals: versionId },
      parent: { equals: page.id },
      'version._status': { equals: 'published' },
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0]?.version ?? null
}
