import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { addDays, type CalendarDate } from '@/lib/format/date'

export const PAGE_SIZE = 12

export type FirmSearch = {
  serviceIds?: string[]
  localityId?: string
  radiusKm?: number
  /** Tylko aktywny termin najpóźniej za tyle dni. */
  withinDays?: number
  vat?: boolean
  minRating?: number
  warranty?: boolean
  page?: number
  today: CalendarDate
  /** Termin aktywny, gdy potwierdzony najwyżej tyle dni temu (SPEC 3.5). */
  expiryDays: number
  /** Pominięcie firm (np. bieżącej w „podobnych firmach”). */
  excludeId?: string
  limit?: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Wyszukiwanie firm (SPEC 3.1): tylko `active`, usługa (z podusługami), obszar działania
 * obejmujący miejscowość (z gminą, powiatem i dzielnicami) albo w promieniu od niej.
 * Kolejność: najbliższy aktywny termin, potem ocena; firmy bez terminu na końcu.
 */
export async function searchFirms(
  payload: Payload,
  input: FirmSearch,
): Promise<{ ids: string[]; total: number }> {
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  const limit = input.limit ?? PAGE_SIZE
  const offset = ((input.page ?? 1) - 1) * limit
  const cutoff = new Date(Date.now() - input.expiryDays * DAY_MS).toISOString()
  const active = sql`(f.availability_date >= ${input.today} AND f.availability_confirmed_at >= ${cutoff})`
  // `sql.param`: tablica jako jeden parametr (bez tego drizzle rozwija ją w listę `($1, $2)`).
  const services = input.serviceIds?.length ? sql.param(input.serviceIds) : null
  const locality = input.localityId ?? null
  const radius = input.radiusKm ?? 0
  const until = input.withinDays ? addDays(input.today, input.withinDays) : null

  const result = await db.execute<{ id: string; total: string }>(sql`
    WITH area AS (
      SELECT id FROM localities WHERE id = ${locality}
      UNION SELECT parent_id FROM localities WHERE id = ${locality} AND parent_id IS NOT NULL
      UNION SELECT p.parent_id FROM localities c JOIN localities p ON p.id = c.parent_id
        WHERE c.id = ${locality} AND p.parent_id IS NOT NULL
      UNION SELECT id FROM localities WHERE parent_id = ${locality}
    ),
    target AS (SELECT lat::float AS lat, lng::float AS lng FROM localities WHERE id = ${locality} AND lat IS NOT NULL)
    SELECT f.id, count(*) OVER () AS total
    FROM firms f
    WHERE f.status = 'active'
      AND (${input.excludeId ?? null}::uuid IS NULL OR f.id <> ${input.excludeId ?? null}::uuid)
      AND (${services}::uuid[] IS NULL OR EXISTS (
        SELECT 1 FROM firms_rels r WHERE r.parent_id = f.id AND r.path = 'services' AND r.services_id = ANY(${services}::uuid[])))
      AND (${locality}::uuid IS NULL
        OR EXISTS (SELECT 1 FROM firms_rels r WHERE r.parent_id = f.id AND r.path = 'serviceArea' AND r.localities_id IN (SELECT id FROM area))
        OR (${radius}::float > 0 AND EXISTS (
          SELECT 1 FROM firms_rels r JOIN localities l ON l.id = r.localities_id, target t
          WHERE r.parent_id = f.id AND r.path = 'serviceArea' AND l.lat IS NOT NULL
            AND 2 * 6371 * asin(sqrt(
              power(sin(radians(l.lat::float - t.lat) / 2), 2)
              + cos(radians(t.lat)) * cos(radians(l.lat::float)) * power(sin(radians(l.lng::float - t.lng) / 2), 2)
            )) <= ${radius}::float)))
      AND (NOT ${input.vat ?? false}::boolean OR f.vat_invoice)
      AND (${input.minRating ?? null}::numeric IS NULL OR f.rating_avg >= ${input.minRating ?? null}::numeric)
      AND (NOT ${input.warranty ?? false}::boolean OR f.warranty_months > 0)
      AND (${until}::text IS NULL OR (${active} AND f.availability_date <= ${until}))
    ORDER BY (CASE WHEN ${active} THEN f.availability_date END) ASC NULLS LAST,
      f.rating_avg DESC NULLS LAST, f.rating_count DESC NULLS LAST, f.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `)
  return { ids: result.rows.map((row) => row.id), total: Number(result.rows[0]?.total ?? 0) }
}
