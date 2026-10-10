import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "localities" ADD COLUMN "is_city" boolean DEFAULT false;
  CREATE INDEX "localities_is_city_idx" ON "localities" USING btree ("is_city");`)
  // Istniejące dane: miasto = miejscowość o nazwie swojej gminy miejskiej lub miejsko-wiejskiej
  // (ta sama reguła co `townIds` przy imporcie TERYT).
  await db.execute(sql`
   UPDATE "localities" AS l SET "is_city" = true
   FROM "localities" AS g
   WHERE l."type" = 'miejscowosc' AND l."parent_id" = g."id" AND g."type" = 'gmina'
     AND right(g."teryt_id", 1) IN ('1', '3') AND g."name" = l."name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "localities_is_city_idx";
  ALTER TABLE "localities" DROP COLUMN "is_city";`)
}
