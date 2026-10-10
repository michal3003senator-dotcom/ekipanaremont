import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'anonymizeInquiries' BEFORE 'remindAvailability';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'anonymizeInquiries' BEFORE 'remindAvailability';
  ALTER TABLE "inquiries" ADD COLUMN "anonymized_at" timestamp(3) with time zone;
  CREATE INDEX "inquiries_anonymized_at_idx" ON "inquiries" USING btree ("anonymized_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled', 'moderationAlert', 'moderationDailyDigest');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled', 'moderationAlert', 'moderationDailyDigest');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "inquiries_anonymized_at_idx";
  ALTER TABLE "inquiries" DROP COLUMN "anonymized_at";`)
}
