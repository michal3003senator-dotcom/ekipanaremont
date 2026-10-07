import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Wyszukiwanie miejscowości po fragmencie nazwy bez polskich znaków (SPEC 4: localities(name) z pg_trgm). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS "localities_name_search_trgm_idx" ON "localities" USING gin ("name_search" gin_trgm_ops);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "localities_name_search_trgm_idx";`)
}
