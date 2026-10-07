import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { CollectionSlug, Payload } from 'payload'

import { getKeyring } from './keyring'
import { encryptedFields } from './registry'

/** Nazwy tabel i kolumn Payload w PostgreSQL: `forumThreads` → `forum_threads`. */
const snake = (name: string) => name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

/**
 * Przepisuje kluczem bieżącym wartości (S) zaszyfrowane starszą wersją (ADR 0007).
 * Idempotentne, bez wypisywania wartości. Zwraca liczbę przepisanych wartości.
 */
export async function rotateEncryptedFields(payload: Payload): Promise<number> {
  const { version } = getKeyring().current
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  let rotated = 0

  for (const { collection, field } of encryptedFields()) {
    const column = sql.identifier(snake(field))
    const stale = await db.execute<{ id: string }>(
      sql`SELECT id FROM ${sql.identifier(snake(collection))} WHERE ${column} LIKE 'enc:v%' AND ${column} NOT LIKE ${`enc:v${version}:%`}`,
    )
    for (const { id } of stale.rows) {
      const slug = collection as CollectionSlug
      const doc = await payload.findByID({
        collection: slug,
        id,
        depth: 0,
        overrideAccess: true,
        showHiddenFields: true,
      })
      await payload.update({
        collection: slug,
        id,
        data: { [field]: (doc as unknown as Record<string, unknown>)[field] },
        depth: 0,
        overrideAccess: true,
        context: { skipAudit: true },
      })
      rotated += 1
    }
  }
  return rotated
}
