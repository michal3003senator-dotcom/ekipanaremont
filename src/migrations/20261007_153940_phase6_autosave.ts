import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_articles_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_calculators_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_calculators_v_autosave_idx" ON "_calculators_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "_articles_v_autosave_idx";
  DROP INDEX "_pages_v_autosave_idx";
  DROP INDEX "_calculators_v_autosave_idx";
  ALTER TABLE "_articles_v" DROP COLUMN "autosave";
  ALTER TABLE "_pages_v" DROP COLUMN "autosave";
  ALTER TABLE "_calculators_v" DROP COLUMN "autosave";`)
}
