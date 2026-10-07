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

/** Podpowiedzi miejscowości bez polskich znaków (indeks pg_trgm); miasta przed wsiami. */
export async function searchLocalities(
  payload: Payload,
  query: string,
  limit = 10,
): Promise<LocalityOption[]> {
  const needle = normalizeSearch(query).slice(0, 60)
  if (needle.length < 2) return []
  const { docs } = await payload.find({
    collection: 'localities',
    where: { nameSearch: { like: needle }, type: { in: ['miejscowosc', 'dzielnica'] } },
    sort: 'name',
    limit: 40,
    depth: 2,
    overrideAccess: true,
  })
  return docs
    .sort((a, b) => rank(a, needle) - rank(b, needle) || a.name.length - b.name.length)
    .slice(0, limit)
    .map(toOption)
}

/** Najpierw nazwy zaczynające się od frazy. */
const rank = (locality: Locality, needle: string) =>
  (locality.nameSearch ?? '').startsWith(needle) ? 0 : 1
