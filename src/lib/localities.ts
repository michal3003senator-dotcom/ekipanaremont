import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { normalizeSearch } from '@/lib/format/search'
import type { Locality } from '@/payload-types'

export type LocalityOption = { value: string; label: string; description?: string }

const name = (value: unknown) =>
  value && typeof value === 'object' && 'name' in value ? String(value.name) : null
const parentOf = (value: Locality['parent']) => (value && typeof value === 'object' ? value : null)

/** „gm. Zelów, pow. łaski” – rozróżnia miejscowości o tej samej nazwie (PLAN pyt. 8). */
export function localityDescription(locality: Locality): string | undefined {
  if (locality.type === 'dzielnica') return 'dzielnica Łodzi'
  const gmina = parentOf(locality.parent)
  const powiat = gmina ? parentOf(gmina.parent) : null
  const parts = [gmina && `gm. ${name(gmina)}`, powiat && `pow. ${name(powiat)}`].filter(Boolean)
  return parts.length ? parts.join(', ') : undefined
}

export const toOption = (locality: Locality): LocalityOption => ({
  value: locality.id,
  label: locality.name,
  description: localityDescription(locality),
})

/**
 * Podpowiedzi miejscowości bez polskich znaków i odporne na literówki (SPEC 3.1, pg_trgm):
 * najpierw dokładna nazwa, potem nazwy zaczynające się od frazy, potem najbardziej podobne.
 */
export async function searchLocalities(
  payload: Payload,
  query: string,
  { limit = 10, value = 'id' }: { limit?: number; value?: 'id' | 'slug' } = {},
): Promise<LocalityOption[]> {
  const needle = normalizeSearch(query).slice(0, 60)
  if (needle.length < 2) return []
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  const { rows } = await db.execute<{ id: string }>(sql`
    SELECT id FROM localities
    WHERE type IN ('miejscowosc', 'dzielnica')
      AND (name_search LIKE ${`${needle}%`} OR name_search % ${needle})
    ORDER BY name_search = ${needle} DESC, name_search LIKE ${`${needle}%`} DESC,
      similarity(name_search, ${needle}) DESC, length(name) ASC
    LIMIT ${limit}
  `)
  if (!rows.length) return []
  const ids = rows.map((row) => row.id)
  const { docs } = await payload.find({
    collection: 'localities',
    where: { id: { in: ids } },
    depth: 2,
    pagination: false,
    overrideAccess: true,
  })
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  return ids
    .map((id) => byId.get(id))
    .filter((doc): doc is Locality => Boolean(doc))
    .map((doc) => ({ ...toOption(doc), value: value === 'slug' ? (doc.slug ?? doc.id) : doc.id }))
}
