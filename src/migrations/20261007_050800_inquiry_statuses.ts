import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_inquiries_status";
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in_contact', 'closed', 'spam');
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_inquiries_status" USING "status"::"public"."enum_inquiries_status";
  ALTER TABLE "firms" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "calculators" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "forum_categories" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "forum_threads" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "localities" ALTER COLUMN "slug" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_inquiries_status";
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'read', 'archived');
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_inquiries_status" USING "status"::"public"."enum_inquiries_status";
  ALTER TABLE "firms" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "calculators" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "forum_categories" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "forum_threads" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "localities" ALTER COLUMN "slug" SET NOT NULL;`)
}
