import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_legal_kind" AS ENUM('terms', 'privacy');
  CREATE TYPE "public"."enum__pages_v_version_legal_kind" AS ENUM('terms', 'privacy');
  CREATE TYPE "public"."enum_calculators_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__calculators_v_version_type" AS ENUM('bathroomCost', 'tiles', 'paint', 'skimCoat');
  CREATE TYPE "public"."enum__calculators_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "article_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" uuid,
  	"seo_canonical" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "local_intros" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"service_id" uuid NOT NULL,
  	"locality_id" uuid NOT NULL,
  	"intro" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" uuid,
  	"seo_canonical" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_calculators_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_type" "enum__calculators_v_version_type",
  	"version_intro" varchar,
  	"version_bathroom_cost_labour_per_m2_min" numeric,
  	"version_bathroom_cost_labour_per_m2_max" numeric,
  	"version_bathroom_cost_materials_per_m2_min" numeric,
  	"version_bathroom_cost_materials_per_m2_max" numeric,
  	"version_tiles_waste_percent" numeric,
  	"version_paint_coverage_m2_per_litre" numeric,
  	"version_paint_coats" numeric,
  	"version_paint_waste_percent" numeric,
  	"version_skim_coat_kg_per_m2_per_mm" numeric,
  	"version_skim_coat_bag_kg" numeric,
  	"version_skim_coat_labour_per_m2_min" numeric,
  	"version_skim_coat_labour_per_m2_max" numeric,
  	"version_disclaimer" varchar,
  	"version_linked_service_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__calculators_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "articles" DROP CONSTRAINT "articles_author_id_staff_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_author_id_staff_id_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'publishScheduled');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "articles_author_idx";
  DROP INDEX "_articles_v_version_version_author_idx";
  DROP INDEX "articles_category_idx";
  DROP INDEX "_articles_v_version_version_category_idx";
  ALTER TABLE "calculators" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "calculators" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "category_id" uuid;
  ALTER TABLE "articles" ADD COLUMN "author_name" varchar;
  ALTER TABLE "articles" ADD COLUMN "publish_at" timestamp(3) with time zone;
  ALTER TABLE "articles" ADD COLUMN "reading_minutes" numeric;
  ALTER TABLE "_articles_v" ADD COLUMN "version_category_id" uuid;
  ALTER TABLE "_articles_v" ADD COLUMN "version_author_name" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_reading_minutes" numeric;
  ALTER TABLE "pages" ADD COLUMN "legal_kind" "enum_pages_legal_kind";
  ALTER TABLE "_pages_v" ADD COLUMN "version_legal_kind" "enum__pages_v_version_legal_kind";
  ALTER TABLE "calculators" ADD COLUMN "intro" varchar;
  ALTER TABLE "calculators" ADD COLUMN "bathroom_cost_labour_per_m2_min" numeric;
  ALTER TABLE "calculators" ADD COLUMN "bathroom_cost_labour_per_m2_max" numeric;
  ALTER TABLE "calculators" ADD COLUMN "bathroom_cost_materials_per_m2_min" numeric;
  ALTER TABLE "calculators" ADD COLUMN "bathroom_cost_materials_per_m2_max" numeric;
  ALTER TABLE "calculators" ADD COLUMN "tiles_waste_percent" numeric;
  ALTER TABLE "calculators" ADD COLUMN "paint_coverage_m2_per_litre" numeric;
  ALTER TABLE "calculators" ADD COLUMN "paint_coats" numeric;
  ALTER TABLE "calculators" ADD COLUMN "paint_waste_percent" numeric;
  ALTER TABLE "calculators" ADD COLUMN "skim_coat_kg_per_m2_per_mm" numeric;
  ALTER TABLE "calculators" ADD COLUMN "skim_coat_bag_kg" numeric;
  ALTER TABLE "calculators" ADD COLUMN "skim_coat_labour_per_m2_min" numeric;
  ALTER TABLE "calculators" ADD COLUMN "skim_coat_labour_per_m2_max" numeric;
  ALTER TABLE "calculators" ADD COLUMN "_status" "enum_calculators_status" DEFAULT 'draft';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "article_categories_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "local_intros_id" uuid;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "local_intros" ADD CONSTRAINT "local_intros_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "local_intros" ADD CONSTRAINT "local_intros_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "local_intros" ADD CONSTRAINT "local_intros_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_calculators_v" ADD CONSTRAINT "_calculators_v_parent_id_calculators_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_calculators_v" ADD CONSTRAINT "_calculators_v_version_linked_service_id_services_id_fk" FOREIGN KEY ("version_linked_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "article_categories_slug_idx" ON "article_categories" USING btree ("slug");
  CREATE INDEX "article_categories_seo_seo_image_idx" ON "article_categories" USING btree ("seo_image_id");
  CREATE INDEX "article_categories_updated_at_idx" ON "article_categories" USING btree ("updated_at");
  CREATE INDEX "article_categories_created_at_idx" ON "article_categories" USING btree ("created_at");
  CREATE INDEX "local_intros_service_idx" ON "local_intros" USING btree ("service_id");
  CREATE INDEX "local_intros_locality_idx" ON "local_intros" USING btree ("locality_id");
  CREATE INDEX "local_intros_seo_seo_image_idx" ON "local_intros" USING btree ("seo_image_id");
  CREATE INDEX "local_intros_updated_at_idx" ON "local_intros" USING btree ("updated_at");
  CREATE INDEX "local_intros_created_at_idx" ON "local_intros" USING btree ("created_at");
  CREATE UNIQUE INDEX "service_locality_idx" ON "local_intros" USING btree ("service_id","locality_id");
  CREATE INDEX "_calculators_v_parent_idx" ON "_calculators_v" USING btree ("parent_id");
  CREATE INDEX "_calculators_v_version_version_slug_idx" ON "_calculators_v" USING btree ("version_slug");
  CREATE INDEX "_calculators_v_version_version_type_idx" ON "_calculators_v" USING btree ("version_type");
  CREATE INDEX "_calculators_v_version_version_linked_service_idx" ON "_calculators_v" USING btree ("version_linked_service_id");
  CREATE INDEX "_calculators_v_version_version_updated_at_idx" ON "_calculators_v" USING btree ("version_updated_at");
  CREATE INDEX "_calculators_v_version_version_created_at_idx" ON "_calculators_v" USING btree ("version_created_at");
  CREATE INDEX "_calculators_v_version_version__status_idx" ON "_calculators_v" USING btree ("version__status");
  CREATE INDEX "_calculators_v_created_at_idx" ON "_calculators_v" USING btree ("created_at");
  CREATE INDEX "_calculators_v_updated_at_idx" ON "_calculators_v" USING btree ("updated_at");
  CREATE INDEX "_calculators_v_latest_idx" ON "_calculators_v" USING btree ("latest");
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_article_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_local_intros_fk" FOREIGN KEY ("local_intros_id") REFERENCES "public"."local_intros"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_publish_at_idx" ON "articles" USING btree ("publish_at");
  CREATE INDEX "_articles_v_version_version_publish_at_idx" ON "_articles_v" USING btree ("version_publish_at");
  CREATE UNIQUE INDEX "pages_legal_kind_idx" ON "pages" USING btree ("legal_kind");
  CREATE INDEX "_pages_v_version_version_legal_kind_idx" ON "_pages_v" USING btree ("version_legal_kind");
  CREATE INDEX "calculators__status_idx" ON "calculators" USING btree ("_status");
  CREATE INDEX "payload_locked_documents_rels_article_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("article_categories_id");
  CREATE INDEX "payload_locked_documents_rels_local_intros_id_idx" ON "payload_locked_documents_rels" USING btree ("local_intros_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  ALTER TABLE "articles" DROP COLUMN "category";
  ALTER TABLE "articles" DROP COLUMN "author_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_category";
  ALTER TABLE "_articles_v" DROP COLUMN "version_author_id";
  ALTER TABLE "calculators" DROP COLUMN "params";
  ALTER TABLE "settings" DROP COLUMN "legal_versions_terms";
  ALTER TABLE "settings" DROP COLUMN "legal_versions_privacy";
  ALTER TABLE "settings" DROP COLUMN "legal_versions_inquiry_consent";
  ALTER TABLE "settings" DROP COLUMN "legal_versions_lead_consent";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "article_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "local_intros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_calculators_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "article_categories" CASCADE;
  DROP TABLE "local_intros" CASCADE;
  DROP TABLE "_calculators_v" CASCADE;
  ALTER TABLE "articles" DROP CONSTRAINT "articles_category_id_article_categories_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_category_id_article_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_article_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_local_intros_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'remindAvailability', 'expireAvailability', 'remindTrialEnding', 'requestReviews', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "articles_publish_at_idx";
  DROP INDEX "_articles_v_version_version_publish_at_idx";
  DROP INDEX "pages_legal_kind_idx";
  DROP INDEX "_pages_v_version_version_legal_kind_idx";
  DROP INDEX "calculators__status_idx";
  DROP INDEX "payload_locked_documents_rels_article_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_local_intros_id_idx";
  DROP INDEX "articles_category_idx";
  DROP INDEX "_articles_v_version_version_category_idx";
  ALTER TABLE "calculators" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "calculators" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "category" varchar;
  ALTER TABLE "articles" ADD COLUMN "author_id" uuid;
  ALTER TABLE "_articles_v" ADD COLUMN "version_category" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_author_id" uuid;
  ALTER TABLE "calculators" ADD COLUMN "params" jsonb NOT NULL;
  ALTER TABLE "settings" ADD COLUMN "legal_versions_terms" varchar;
  ALTER TABLE "settings" ADD COLUMN "legal_versions_privacy" varchar;
  ALTER TABLE "settings" ADD COLUMN "legal_versions_inquiry_consent" varchar;
  ALTER TABLE "settings" ADD COLUMN "legal_versions_lead_consent" varchar;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_staff_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_staff_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category");
  ALTER TABLE "articles" DROP COLUMN "category_id";
  ALTER TABLE "articles" DROP COLUMN "author_name";
  ALTER TABLE "articles" DROP COLUMN "publish_at";
  ALTER TABLE "articles" DROP COLUMN "reading_minutes";
  ALTER TABLE "_articles_v" DROP COLUMN "version_category_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_author_name";
  ALTER TABLE "_articles_v" DROP COLUMN "version_publish_at";
  ALTER TABLE "_articles_v" DROP COLUMN "version_reading_minutes";
  ALTER TABLE "pages" DROP COLUMN "legal_kind";
  ALTER TABLE "_pages_v" DROP COLUMN "version_legal_kind";
  ALTER TABLE "calculators" DROP COLUMN "intro";
  ALTER TABLE "calculators" DROP COLUMN "bathroom_cost_labour_per_m2_min";
  ALTER TABLE "calculators" DROP COLUMN "bathroom_cost_labour_per_m2_max";
  ALTER TABLE "calculators" DROP COLUMN "bathroom_cost_materials_per_m2_min";
  ALTER TABLE "calculators" DROP COLUMN "bathroom_cost_materials_per_m2_max";
  ALTER TABLE "calculators" DROP COLUMN "tiles_waste_percent";
  ALTER TABLE "calculators" DROP COLUMN "paint_coverage_m2_per_litre";
  ALTER TABLE "calculators" DROP COLUMN "paint_coats";
  ALTER TABLE "calculators" DROP COLUMN "paint_waste_percent";
  ALTER TABLE "calculators" DROP COLUMN "skim_coat_kg_per_m2_per_mm";
  ALTER TABLE "calculators" DROP COLUMN "skim_coat_bag_kg";
  ALTER TABLE "calculators" DROP COLUMN "skim_coat_labour_per_m2_min";
  ALTER TABLE "calculators" DROP COLUMN "skim_coat_labour_per_m2_max";
  ALTER TABLE "calculators" DROP COLUMN "_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "article_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "local_intros_id";
  DROP TYPE "public"."enum_pages_legal_kind";
  DROP TYPE "public"."enum__pages_v_version_legal_kind";
  DROP TYPE "public"."enum_calculators_status";
  DROP TYPE "public"."enum__calculators_v_version_type";
  DROP TYPE "public"."enum__calculators_v_version_status";`)
}
