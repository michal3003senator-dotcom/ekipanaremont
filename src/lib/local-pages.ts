import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { cache } from 'react'

import { idOf } from '@/access'
import { allServices } from '@/lib/search/options'
import type { Locality, Service } from '@/payload-types'

type LocalityRef = Pick<Locality, 'name' | 'type'> & { parent?: unknown }

/**
 * Miejscowość ze stroną lokalną (PLAN pyt. 21): dzielnica Łodzi albo siedziba gminy
 * (nazwa = nazwa gminy nadrzędnej). Wsie bez siedziby gminy nie dostają osobnych stron.
 */
export function isLocalPageLocality(locality: LocalityRef): boolean {
  if (locality.type === 'dzielnica') return true
  const parent = locality.parent as LocalityRef | null | undefined
  return (
    locality.type === 'miejscowosc' &&
    typeof parent === 'object' &&
    parent?.type === 'gmina' &&
    parent.name.toLocaleLowerCase('pl-PL') === locality.name.toLocaleLowerCase('pl-PL')
  )
}

/** Nazwa na stronie: „Widzew, Łódź” dla dzielnicy, inaczej sama nazwa. */
export function localityLabel(locality: LocalityRef): string {
  const parent = locality.parent as LocalityRef | null | undefined
  return locality.type === 'dzielnica' && typeof parent === 'object' && parent
    ? `${locality.name}, ${parent.name}`
    : locality.name
}

/** To samo kryterium obszaru co wyszukiwarka (searchFirms): miejscowość, gmina, powiat, dzielnice. */
const COVERS = sql`(l.id = a.id OR l.parent_id = a.id OR a.parent_id = l.id
  OR l.parent_id IN (SELECT c.id FROM localities c WHERE c.parent_id = a.id))`

const ELIGIBLE = sql`(l.type = 'dzielnica' OR (l.type = 'miejscowosc' AND g.type = 'gmina'
  AND lower(g.name) = lower(l.name)))`

/**
 * Pary usługa–miejscowość z co najmniej 1 aktywną firmą (SPEC 3.14) – do mapy strony.
 * Usługi główne; firma z podusługą liczy się dla usługi nadrzędnej.
 */
export async function localPagePairs(
  payload: Payload,
): Promise<Array<{ service: string; locality: string }>> {
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  const { rows } = await db.execute<{ service: string; locality: string }>(sql`
    SELECT DISTINCT s.slug AS service, l.slug AS locality
    FROM firms f
    JOIN firms_rels rs ON rs.parent_id = f.id AND rs.path = 'services'
    JOIN services sv ON sv.id = rs.services_id
    JOIN services s ON s.id = COALESCE(sv.parent_id, sv.id)
    JOIN firms_rels ra ON ra.parent_id = f.id AND ra.path = 'serviceArea'
    JOIN localities a ON a.id = ra.localities_id
    JOIN localities l ON ${COVERS}
    LEFT JOIN localities g ON g.id = l.parent_id
    WHERE f.status = 'active' AND s.parent_id IS NULL AND s.slug IS NOT NULL
      AND l.slug IS NOT NULL AND ${ELIGIBLE}
    ORDER BY 1, 2
  `)
  return rows
}

export type LocalPage = {
  service: Service
  serviceIds: string[]
  locality: Locality
  label: string
}

/** Strona lokalna albo `null` (404): usługa główna, miejscowość z listy i co najmniej 1 aktywna firma. */
export const findLocalPage = cache(
  async (
    payload: Payload,
    serviceSlug: string,
    localitySlug: string,
  ): Promise<LocalPage | null> => {
    const services = await allServices(payload)
    const service = services.find((item) => item.slug === serviceSlug && !item.parent)
    if (!service) return null
    const { docs } = await payload.find({
      collection: 'localities',
      where: { slug: { equals: localitySlug } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })
    const locality = docs[0]
    if (!locality || !isLocalPageLocality(locality)) return null
    const serviceIds = [
      service.id,
      ...services.filter((item) => idOf(item.parent) === service.id).map((item) => item.id),
    ]
    return { service, serviceIds, locality, label: localityLabel(locality) }
  },
)
