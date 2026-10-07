import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "firms" ADD COLUMN "mail_log_availability_reminder_at" timestamp(3) with time zone;
  ALTER TABLE "firms" ADD COLUMN "mail_log_availability_expired_at" timestamp(3) with time zone;
  ALTER TABLE "firms" ADD COLUMN "mail_log_trial_ending7_at" timestamp(3) with time zone;
  ALTER TABLE "firms" ADD COLUMN "mail_log_trial_ending1_at" timestamp(3) with time zone;
  ALTER TABLE "firm_accounts" ADD COLUMN "notification_prefs_inquiries" boolean DEFAULT true;
  ALTER TABLE "firm_accounts" ADD COLUMN "notification_prefs_availability_reminders" boolean DEFAULT true;
  ALTER TABLE "firm_accounts" ADD COLUMN "notification_prefs_reviews" boolean DEFAULT true;
  ALTER TABLE "firm_accounts" ADD COLUMN "verification_sent_at" timestamp(3) with time zone;
  ALTER TABLE "firm_accounts" DROP COLUMN "notification_prefs";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "firm_accounts" ADD COLUMN "notification_prefs" jsonb;
  ALTER TABLE "firms" DROP COLUMN "mail_log_availability_reminder_at";
  ALTER TABLE "firms" DROP COLUMN "mail_log_availability_expired_at";
  ALTER TABLE "firms" DROP COLUMN "mail_log_trial_ending7_at";
  ALTER TABLE "firms" DROP COLUMN "mail_log_trial_ending1_at";
  ALTER TABLE "firm_accounts" DROP COLUMN "notification_prefs_inquiries";
  ALTER TABLE "firm_accounts" DROP COLUMN "notification_prefs_availability_reminders";
  ALTER TABLE "firm_accounts" DROP COLUMN "notification_prefs_reviews";
  ALTER TABLE "firm_accounts" DROP COLUMN "verification_sent_at";`)
}
