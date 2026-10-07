import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { type CalendarDate, todayInWarsaw } from '@/lib/format/date'

export type StatField = 'views' | 'phoneReveals' | 'inquiries'

const COLUMN = {
  views: sql.raw('views'),
  phoneReveals: sql.raw('phone_reveals'),
  inquiries: sql.raw('inquiries'),
} as const satisfies Record<StatField, unknown>

/**
 * Zwiększa dzienny licznik firmy jednym poleceniem SQL (`ON CONFLICT … DO UPDATE`):
 * równoległe wyświetlenia nie gubią się i nie tworzą dwóch wierszy na ten sam dzień.
 */
export async function bumpStat(
  payload: Payload,
  firmId: string,
  field: StatField,
  date: CalendarDate = todayInWarsaw(),
): Promise<void> {
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  const column = COLUMN[field]
  await db.execute(sql`
    INSERT INTO firm_stats_daily (firm_id, date, ${column})
    VALUES (${firmId}::uuid, ${date}, 1)
    ON CONFLICT (firm_id, date)
    DO UPDATE SET ${column} = COALESCE(firm_stats_daily.${column}, 0) + 1, updated_at = now()
  `)
}
