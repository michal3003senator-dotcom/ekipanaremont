import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_reports_reason" ADD VALUE 'moderator';
  ALTER TYPE "public"."enum_reports_reason" ADD VALUE 'appeal';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'moderationAlert';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'moderationDailyDigest';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'moderationAlert';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'moderationDailyDigest';
  ALTER TABLE "reports" ADD COLUMN "target_title" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" ALTER COLUMN "reason" SET DATA TYPE text;
  DROP TYPE "public"."enum_reports_reason";
  CREATE TYPE "public"."enum_reports_reason" AS ENUM('illegal', 'fake', 'offensive', 'spam', 'theft', 'other');
  ALTER TABLE "reports" ALTER COLUMN "reason" SET DATA TYPE "public"."enum_reports_reason" USING "reason"::"public"."enum_reports_reason";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  ALTER TABLE "reports" DROP COLUMN "target_title";`)
}
