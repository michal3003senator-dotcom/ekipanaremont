import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_firms_registry_source" AS ENUM('ceidg', 'krs', 'vat');
  CREATE TYPE "public"."enum_firms_status" AS ENUM('draft', 'pending_review', 'active', 'suspended', 'rejected');
  CREATE TYPE "public"."enum_firms_subscription_status" AS ENUM('trial', 'active', 'past_due', 'canceled');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published', 'hidden');
  CREATE TYPE "public"."enum_inquiries_budget_range" AS ENUM('to10k', 'from10to30k', 'from30to60k', 'from60to100k', 'over100k', 'unknown');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'read', 'archived');
  CREATE TYPE "public"."enum_inquiries_source" AS ENUM('direct', 'calculator');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_articles_blocks_heading_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_blocks_heading_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_blocks_heading_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_level" AS ENUM('h2', 'h3');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_calculators_type" AS ENUM('bathroomCost', 'tiles', 'paint', 'skimCoat');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'closed');
  CREATE TYPE "public"."enum_forum_threads_status" AS ENUM('pending', 'visible', 'hidden', 'deleted');
  CREATE TYPE "public"."enum_forum_posts_status" AS ENUM('pending', 'visible', 'hidden', 'deleted');
  CREATE TYPE "public"."enum_forum_reactions_type" AS ENUM('helpful');
  CREATE TYPE "public"."enum_listings_type" AS ENUM('sell', 'swap');
  CREATE TYPE "public"."enum_listings_category" AS ENUM('power_tools', 'machines', 'scaffolding', 'hand_tools', 'surplus_materials', 'other');
  CREATE TYPE "public"."enum_listings_condition" AS ENUM('new', 'used', 'damaged');
  CREATE TYPE "public"."enum_listings_status" AS ENUM('draft', 'pending', 'active', 'reserved', 'sold', 'expired', 'hidden');
  CREATE TYPE "public"."enum_reports_target_type" AS ENUM('firms', 'reviews', 'forumThreads', 'forumPosts', 'listings', 'articles');
  CREATE TYPE "public"."enum_reports_reason" AS ENUM('illegal', 'fake', 'offensive', 'spam', 'theft', 'other');
  CREATE TYPE "public"."enum_reports_status" AS ENUM('new', 'in_review', 'resolved', 'rejected');
  CREATE TYPE "public"."enum_reports_decision" AS ENUM('none', 'hidden', 'removed', 'warned', 'banned');
  CREATE TYPE "public"."enum_sanctions_scope" AS ENUM('forum', 'marketplace', 'account');
  CREATE TYPE "public"."enum_sanctions_type" AS ENUM('warning', 'ban');
  CREATE TYPE "public"."enum_localities_type" AS ENUM('wojewodztwo', 'powiat', 'gmina', 'miejscowosc', 'dzielnica');
  CREATE TYPE "public"."enum_media_purpose" AS ENUM('project', 'logo', 'cover', 'forum', 'listing', 'article', 'inquiry');
  CREATE TYPE "public"."enum_staff_role" AS ENUM('admin', 'moderator', 'editor');
  CREATE TYPE "public"."enum_audit_log_actor_type" AS ENUM('staff', 'firm', 'system');
  CREATE TYPE "public"."enum_audit_log_action" AS ENUM('create', 'update', 'delete');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeExpiredLeads', 'schedulePublish');
  CREATE TABLE "firms" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"nip" varchar NOT NULL,
  	"registry_source" "enum_firms_registry_source",
  	"registry_data" jsonb,
  	"registry_verified_at" timestamp(3) with time zone,
  	"short_description" varchar,
  	"about" jsonb,
  	"logo_id" uuid,
  	"cover_id" uuid,
  	"base_locality_id" uuid,
  	"phone" varchar,
  	"website" varchar,
  	"vat_invoice" boolean DEFAULT false,
  	"warranty_months" numeric,
  	"years_experience" numeric,
  	"team_size" numeric,
  	"availability_date" varchar,
  	"availability_confirmed_at" timestamp(3) with time zone,
  	"status" "enum_firms_status" DEFAULT 'draft' NOT NULL,
  	"moderation_reason" varchar,
  	"trial_starts_at" timestamp(3) with time zone,
  	"trial_ends_at" timestamp(3) with time zone,
  	"subscription_status" "enum_firms_subscription_status" DEFAULT 'trial' NOT NULL,
  	"rating_avg" numeric,
  	"rating_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "firms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" uuid,
  	"localities_id" uuid
  );
  
  CREATE TABLE "projects" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid NOT NULL,
  	"title" varchar NOT NULL,
  	"service_id" uuid,
  	"locality_id" uuid,
  	"completed_month" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"status" "enum_projects_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid
  );
  
  CREATE TABLE "inquiries" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid NOT NULL,
  	"service_id" uuid,
  	"locality_id" uuid,
  	"description" varchar NOT NULL,
  	"budget_range" "enum_inquiries_budget_range",
  	"timeframe" varchar,
  	"client_name" varchar NOT NULL,
  	"client_email" varchar NOT NULL,
  	"client_email_hash" varchar,
  	"client_phone" varchar,
  	"consent_text_version" varchar NOT NULL,
  	"consent_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"review_token_hash" varchar,
  	"review_token_expires_at" timestamp(3) with time zone,
  	"review_requested_at" timestamp(3) with time zone,
  	"source" "enum_inquiries_source" DEFAULT 'direct',
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid
  );
  
  CREATE TABLE "reviews" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid NOT NULL,
  	"inquiry_id" uuid NOT NULL,
  	"rating" numeric NOT NULL,
  	"title" varchar,
  	"body" varchar NOT NULL,
  	"author_display_name" varchar NOT NULL,
  	"firm_reply" varchar,
  	"firm_reply_at" timestamp(3) with time zone,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"moderation_reason" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"level" "enum_articles_blocks_heading_level" DEFAULT 'h2',
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"author" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "articles_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "articles_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_calculator" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"calculator_id" uuid,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_recommended_firms" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_id" uuid,
  	"locality_id" uuid,
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"cover_id" uuid,
  	"category" varchar,
  	"author_id" uuid,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" uuid,
  	"seo_canonical" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"services_id" uuid
  );
  
  CREATE TABLE "_articles_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"text" varchar,
  	"level" "enum__articles_v_blocks_heading_level" DEFAULT 'h2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"text" varchar,
  	"author" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_calculator" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"calculator_id" uuid,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_recommended_firms" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"service_id" uuid,
  	"locality_id" uuid,
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" uuid,
  	"version_category" varchar,
  	"version_author_id" uuid,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" uuid,
  	"version_seo_canonical" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"services_id" uuid
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"level" "enum_pages_blocks_heading_level" DEFAULT 'h2',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"legal_version" varchar,
  	"effective_from" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" uuid,
  	"seo_canonical" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"text" varchar,
  	"level" "enum__pages_v_blocks_heading_level" DEFAULT 'h2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_legal_version" varchar,
  	"version_effective_from" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" uuid,
  	"version_seo_canonical" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "calculators" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_calculators_type" NOT NULL,
  	"params" jsonb NOT NULL,
  	"disclaimer" varchar,
  	"linked_service_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"calculator_id" uuid,
  	"inputs" jsonb,
  	"result" jsonb,
  	"name" varchar,
  	"email" varchar NOT NULL,
  	"email_hash" varchar,
  	"phone" varchar,
  	"consent_text_version" varchar NOT NULL,
  	"consent_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"retention_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forum_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forum_threads" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"category_id" uuid NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"pinned" boolean DEFAULT false,
  	"locked" boolean DEFAULT false,
  	"status" "enum_forum_threads_status" DEFAULT 'pending' NOT NULL,
  	"reply_count" numeric DEFAULT 0,
  	"last_activity_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forum_threads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"firm_accounts_id" uuid,
  	"staff_id" uuid
  );
  
  CREATE TABLE "forum_posts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"thread_id" uuid NOT NULL,
  	"body" varchar NOT NULL,
  	"status" "enum_forum_posts_status" DEFAULT 'pending' NOT NULL,
  	"edited_at" timestamp(3) with time zone,
  	"helpful_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forum_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"firm_accounts_id" uuid,
  	"staff_id" uuid,
  	"media_id" uuid
  );
  
  CREATE TABLE "forum_reactions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"post_id" uuid NOT NULL,
  	"account_id" uuid NOT NULL,
  	"type" "enum_forum_reactions_type" DEFAULT 'helpful' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "listings" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid NOT NULL,
  	"type" "enum_listings_type" NOT NULL,
  	"category" "enum_listings_category" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"condition" "enum_listings_condition",
  	"price_grosze" numeric,
  	"negotiable" boolean DEFAULT false,
  	"swap_for" varchar,
  	"vat_invoice" boolean DEFAULT false,
  	"locality_id" uuid,
  	"serial_number" varchar,
  	"status" "enum_listings_status" DEFAULT 'draft' NOT NULL,
  	"expires_at" timestamp(3) with time zone,
  	"view_count" numeric DEFAULT 0,
  	"theft_report_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "listings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid
  );
  
  CREATE TABLE "listing_messages" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"listing_id" uuid NOT NULL,
  	"from_firm_id" uuid NOT NULL,
  	"body" varchar NOT NULL,
  	"delivered_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reports" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"target_type" "enum_reports_target_type" NOT NULL,
  	"target_id" varchar NOT NULL,
  	"reason" "enum_reports_reason" NOT NULL,
  	"description" varchar,
  	"reporter_name" varchar,
  	"reporter_email" varchar,
  	"reporter_account_id" uuid,
  	"good_faith_confirmed" boolean,
  	"status" "enum_reports_status" DEFAULT 'new' NOT NULL,
  	"decision" "enum_reports_decision",
  	"statement_of_reasons" varchar,
  	"decided_by_id" uuid,
  	"decided_at" timestamp(3) with time zone,
  	"appeal_of_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sanctions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"account_id" uuid NOT NULL,
  	"scope" "enum_sanctions_scope" NOT NULL,
  	"type" "enum_sanctions_type" NOT NULL,
  	"until" timestamp(3) with time zone,
  	"reason" varchar NOT NULL,
  	"created_by_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" uuid,
  	"icon" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" uuid,
  	"seo_canonical" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "localities" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"teryt_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"name_search" varchar,
  	"type" "enum_localities_type" NOT NULL,
  	"parent_id" uuid,
  	"slug" varchar NOT NULL,
  	"lat" numeric,
  	"lng" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"alt" varchar NOT NULL,
  	"purpose" "enum_media_purpose" DEFAULT 'project' NOT NULL,
  	"firm_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "firm_stats_daily" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid NOT NULL,
  	"date" varchar NOT NULL,
  	"views" numeric DEFAULT 0,
  	"phone_reveals" numeric DEFAULT 0,
  	"inquiries" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "firm_accounts_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "firm_accounts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"firm_id" uuid,
  	"terms_version" varchar,
  	"terms_accepted_at" timestamp(3) with time zone,
  	"notification_prefs" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_log" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"actor" varchar,
  	"actor_type" "enum_audit_log_actor_type" NOT NULL,
  	"action" "enum_audit_log_action" NOT NULL,
  	"target_collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "totp_attempts" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_moderation_reason_templates" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"feature_flags_forum" boolean DEFAULT false,
  	"feature_flags_marketplace" boolean DEFAULT false,
  	"feature_flags_calculators" boolean DEFAULT true,
  	"review_delay_days" numeric DEFAULT 14 NOT NULL,
  	"availability_reminder_days" numeric DEFAULT 10 NOT NULL,
  	"availability_expiry_days" numeric DEFAULT 14 NOT NULL,
  	"listing_expiry_days" numeric DEFAULT 30 NOT NULL,
  	"retention_inquiries_months" numeric DEFAULT 24 NOT NULL,
  	"retention_leads_months" numeric DEFAULT 12 NOT NULL,
  	"legal_versions_terms" varchar,
  	"legal_versions_privacy" varchar,
  	"legal_versions_inquiry_consent" varchar,
  	"legal_versions_lead_consent" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "staff" ADD COLUMN "role" "enum_staff_role" DEFAULT 'editor' NOT NULL;
  ALTER TABLE "staff" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "staff" ADD COLUMN "totp_secret" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "firms_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "calculators_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forum_categories_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forum_threads_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forum_posts_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forum_reactions_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listings_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listing_messages_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reports_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sanctions_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "localities_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "firm_stats_daily_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "firm_accounts_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_log_id" uuid;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "firm_accounts_id" uuid;
  ALTER TABLE "firms" ADD CONSTRAINT "firms_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "firms" ADD CONSTRAINT "firms_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "firms" ADD CONSTRAINT "firms_base_locality_id_localities_id_fk" FOREIGN KEY ("base_locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "firms_rels" ADD CONSTRAINT "firms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."firms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "firms_rels" ADD CONSTRAINT "firms_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "firms_rels" ADD CONSTRAINT "firms_rels_localities_fk" FOREIGN KEY ("localities_id") REFERENCES "public"."localities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_text" ADD CONSTRAINT "articles_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_heading" ADD CONSTRAINT "articles_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_image" ADD CONSTRAINT "articles_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_image" ADD CONSTRAINT "articles_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery" ADD CONSTRAINT "articles_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_quote" ADD CONSTRAINT "articles_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_faq_items" ADD CONSTRAINT "articles_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_faq" ADD CONSTRAINT "articles_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_table_rows" ADD CONSTRAINT "articles_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_table" ADD CONSTRAINT "articles_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_cta" ADD CONSTRAINT "articles_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_calculator" ADD CONSTRAINT "articles_blocks_calculator_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_calculator" ADD CONSTRAINT "articles_blocks_calculator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_recommended_firms" ADD CONSTRAINT "articles_blocks_recommended_firms_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_recommended_firms" ADD CONSTRAINT "articles_blocks_recommended_firms_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_recommended_firms" ADD CONSTRAINT "articles_blocks_recommended_firms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_staff_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_text" ADD CONSTRAINT "_articles_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_heading" ADD CONSTRAINT "_articles_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_image" ADD CONSTRAINT "_articles_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_image" ADD CONSTRAINT "_articles_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery" ADD CONSTRAINT "_articles_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_quote" ADD CONSTRAINT "_articles_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_faq_items" ADD CONSTRAINT "_articles_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_faq" ADD CONSTRAINT "_articles_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_table_rows" ADD CONSTRAINT "_articles_v_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_table" ADD CONSTRAINT "_articles_v_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_cta" ADD CONSTRAINT "_articles_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_calculator" ADD CONSTRAINT "_articles_v_blocks_calculator_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_calculator" ADD CONSTRAINT "_articles_v_blocks_calculator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_recommended_firms" ADD CONSTRAINT "_articles_v_blocks_recommended_firms_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_recommended_firms" ADD CONSTRAINT "_articles_v_blocks_recommended_firms_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_recommended_firms" ADD CONSTRAINT "_articles_v_blocks_recommended_firms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_staff_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_texts" ADD CONSTRAINT "_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table_rows" ADD CONSTRAINT "pages_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table" ADD CONSTRAINT "pages_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table_rows" ADD CONSTRAINT "_pages_v_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table" ADD CONSTRAINT "_pages_v_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculators" ADD CONSTRAINT "calculators_linked_service_id_services_id_fk" FOREIGN KEY ("linked_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forum_threads_rels" ADD CONSTRAINT "forum_threads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_threads_rels" ADD CONSTRAINT "forum_threads_rels_firm_accounts_fk" FOREIGN KEY ("firm_accounts_id") REFERENCES "public"."firm_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_threads_rels" ADD CONSTRAINT "forum_threads_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forum_posts_rels" ADD CONSTRAINT "forum_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_posts_rels" ADD CONSTRAINT "forum_posts_rels_firm_accounts_fk" FOREIGN KEY ("firm_accounts_id") REFERENCES "public"."firm_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_posts_rels" ADD CONSTRAINT "forum_posts_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_posts_rels" ADD CONSTRAINT "forum_posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_account_id_firm_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."firm_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings_rels" ADD CONSTRAINT "listings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_rels" ADD CONSTRAINT "listings_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listing_messages" ADD CONSTRAINT "listing_messages_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listing_messages" ADD CONSTRAINT "listing_messages_from_firm_id_firms_id_fk" FOREIGN KEY ("from_firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_account_id_firm_accounts_id_fk" FOREIGN KEY ("reporter_account_id") REFERENCES "public"."firm_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_decided_by_id_staff_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_appeal_of_id_reports_id_fk" FOREIGN KEY ("appeal_of_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_account_id_firm_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."firm_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_created_by_id_staff_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "localities" ADD CONSTRAINT "localities_parent_id_localities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "firm_stats_daily" ADD CONSTRAINT "firm_stats_daily_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "firm_accounts_sessions" ADD CONSTRAINT "firm_accounts_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."firm_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "firm_accounts" ADD CONSTRAINT "firm_accounts_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log_texts" ADD CONSTRAINT "audit_log_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_moderation_reason_templates" ADD CONSTRAINT "settings_moderation_reason_templates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_texts" ADD CONSTRAINT "settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "firms_slug_idx" ON "firms" USING btree ("slug");
  CREATE UNIQUE INDEX "firms_nip_idx" ON "firms" USING btree ("nip");
  CREATE INDEX "firms_logo_idx" ON "firms" USING btree ("logo_id");
  CREATE INDEX "firms_cover_idx" ON "firms" USING btree ("cover_id");
  CREATE INDEX "firms_base_locality_idx" ON "firms" USING btree ("base_locality_id");
  CREATE INDEX "firms_availability_availability_date_idx" ON "firms" USING btree ("availability_date");
  CREATE INDEX "firms_status_idx" ON "firms" USING btree ("status");
  CREATE INDEX "firms_updated_at_idx" ON "firms" USING btree ("updated_at");
  CREATE INDEX "firms_created_at_idx" ON "firms" USING btree ("created_at");
  CREATE INDEX "status_availability_date_idx" ON "firms" USING btree ("status","availability_date");
  CREATE INDEX "firms_rels_order_idx" ON "firms_rels" USING btree ("order");
  CREATE INDEX "firms_rels_parent_idx" ON "firms_rels" USING btree ("parent_id");
  CREATE INDEX "firms_rels_path_idx" ON "firms_rels" USING btree ("path");
  CREATE INDEX "firms_rels_services_id_idx" ON "firms_rels" USING btree ("services_id");
  CREATE INDEX "firms_rels_localities_id_idx" ON "firms_rels" USING btree ("localities_id");
  CREATE INDEX "projects_firm_idx" ON "projects" USING btree ("firm_id");
  CREATE INDEX "projects_service_idx" ON "projects" USING btree ("service_id");
  CREATE INDEX "projects_locality_idx" ON "projects" USING btree ("locality_id");
  CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "inquiries_firm_idx" ON "inquiries" USING btree ("firm_id");
  CREATE INDEX "inquiries_service_idx" ON "inquiries" USING btree ("service_id");
  CREATE INDEX "inquiries_locality_idx" ON "inquiries" USING btree ("locality_id");
  CREATE INDEX "inquiries_client_email_hash_idx" ON "inquiries" USING btree ("client_email_hash");
  CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");
  CREATE INDEX "inquiries_review_token_hash_idx" ON "inquiries" USING btree ("review_token_hash");
  CREATE INDEX "inquiries_ip_hash_idx" ON "inquiries" USING btree ("ip_hash");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "firm_status_createdAt_idx" ON "inquiries" USING btree ("firm_id","status","created_at");
  CREATE INDEX "inquiries_rels_order_idx" ON "inquiries_rels" USING btree ("order");
  CREATE INDEX "inquiries_rels_parent_idx" ON "inquiries_rels" USING btree ("parent_id");
  CREATE INDEX "inquiries_rels_path_idx" ON "inquiries_rels" USING btree ("path");
  CREATE INDEX "inquiries_rels_media_id_idx" ON "inquiries_rels" USING btree ("media_id");
  CREATE INDEX "reviews_firm_idx" ON "reviews" USING btree ("firm_id");
  CREATE UNIQUE INDEX "reviews_inquiry_idx" ON "reviews" USING btree ("inquiry_id");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "firm_status_idx" ON "reviews" USING btree ("firm_id","status");
  CREATE INDEX "articles_blocks_text_order_idx" ON "articles_blocks_text" USING btree ("_order");
  CREATE INDEX "articles_blocks_text_parent_id_idx" ON "articles_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_text_path_idx" ON "articles_blocks_text" USING btree ("_path");
  CREATE INDEX "articles_blocks_heading_order_idx" ON "articles_blocks_heading" USING btree ("_order");
  CREATE INDEX "articles_blocks_heading_parent_id_idx" ON "articles_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_heading_path_idx" ON "articles_blocks_heading" USING btree ("_path");
  CREATE INDEX "articles_blocks_image_order_idx" ON "articles_blocks_image" USING btree ("_order");
  CREATE INDEX "articles_blocks_image_parent_id_idx" ON "articles_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_image_path_idx" ON "articles_blocks_image" USING btree ("_path");
  CREATE INDEX "articles_blocks_image_image_idx" ON "articles_blocks_image" USING btree ("image_id");
  CREATE INDEX "articles_blocks_gallery_order_idx" ON "articles_blocks_gallery" USING btree ("_order");
  CREATE INDEX "articles_blocks_gallery_parent_id_idx" ON "articles_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_gallery_path_idx" ON "articles_blocks_gallery" USING btree ("_path");
  CREATE INDEX "articles_blocks_quote_order_idx" ON "articles_blocks_quote" USING btree ("_order");
  CREATE INDEX "articles_blocks_quote_parent_id_idx" ON "articles_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_quote_path_idx" ON "articles_blocks_quote" USING btree ("_path");
  CREATE INDEX "articles_blocks_faq_items_order_idx" ON "articles_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_faq_items_parent_id_idx" ON "articles_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_faq_order_idx" ON "articles_blocks_faq" USING btree ("_order");
  CREATE INDEX "articles_blocks_faq_parent_id_idx" ON "articles_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_faq_path_idx" ON "articles_blocks_faq" USING btree ("_path");
  CREATE INDEX "articles_blocks_table_rows_order_idx" ON "articles_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "articles_blocks_table_rows_parent_id_idx" ON "articles_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_table_order_idx" ON "articles_blocks_table" USING btree ("_order");
  CREATE INDEX "articles_blocks_table_parent_id_idx" ON "articles_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_table_path_idx" ON "articles_blocks_table" USING btree ("_path");
  CREATE INDEX "articles_blocks_cta_order_idx" ON "articles_blocks_cta" USING btree ("_order");
  CREATE INDEX "articles_blocks_cta_parent_id_idx" ON "articles_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_cta_path_idx" ON "articles_blocks_cta" USING btree ("_path");
  CREATE INDEX "articles_blocks_calculator_order_idx" ON "articles_blocks_calculator" USING btree ("_order");
  CREATE INDEX "articles_blocks_calculator_parent_id_idx" ON "articles_blocks_calculator" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_calculator_path_idx" ON "articles_blocks_calculator" USING btree ("_path");
  CREATE INDEX "articles_blocks_calculator_calculator_idx" ON "articles_blocks_calculator" USING btree ("calculator_id");
  CREATE INDEX "articles_blocks_recommended_firms_order_idx" ON "articles_blocks_recommended_firms" USING btree ("_order");
  CREATE INDEX "articles_blocks_recommended_firms_parent_id_idx" ON "articles_blocks_recommended_firms" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_recommended_firms_path_idx" ON "articles_blocks_recommended_firms" USING btree ("_path");
  CREATE INDEX "articles_blocks_recommended_firms_service_idx" ON "articles_blocks_recommended_firms" USING btree ("service_id");
  CREATE INDEX "articles_blocks_recommended_firms_locality_idx" ON "articles_blocks_recommended_firms" USING btree ("locality_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
  CREATE INDEX "articles_seo_seo_image_idx" ON "articles" USING btree ("seo_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_media_id_idx" ON "articles_rels" USING btree ("media_id");
  CREATE INDEX "articles_rels_services_id_idx" ON "articles_rels" USING btree ("services_id");
  CREATE INDEX "_articles_v_blocks_text_order_idx" ON "_articles_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_text_parent_id_idx" ON "_articles_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_text_path_idx" ON "_articles_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_heading_order_idx" ON "_articles_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_heading_parent_id_idx" ON "_articles_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_heading_path_idx" ON "_articles_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_image_order_idx" ON "_articles_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_image_parent_id_idx" ON "_articles_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_image_path_idx" ON "_articles_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_image_image_idx" ON "_articles_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_articles_v_blocks_gallery_order_idx" ON "_articles_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_gallery_parent_id_idx" ON "_articles_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_gallery_path_idx" ON "_articles_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_quote_order_idx" ON "_articles_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_quote_parent_id_idx" ON "_articles_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_quote_path_idx" ON "_articles_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_faq_items_order_idx" ON "_articles_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_faq_items_parent_id_idx" ON "_articles_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_faq_order_idx" ON "_articles_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_faq_parent_id_idx" ON "_articles_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_faq_path_idx" ON "_articles_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_table_rows_order_idx" ON "_articles_v_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_table_rows_parent_id_idx" ON "_articles_v_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_table_order_idx" ON "_articles_v_blocks_table" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_table_parent_id_idx" ON "_articles_v_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_table_path_idx" ON "_articles_v_blocks_table" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_cta_order_idx" ON "_articles_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_cta_parent_id_idx" ON "_articles_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_cta_path_idx" ON "_articles_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_calculator_order_idx" ON "_articles_v_blocks_calculator" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_calculator_parent_id_idx" ON "_articles_v_blocks_calculator" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_calculator_path_idx" ON "_articles_v_blocks_calculator" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_calculator_calculator_idx" ON "_articles_v_blocks_calculator" USING btree ("calculator_id");
  CREATE INDEX "_articles_v_blocks_recommended_firms_order_idx" ON "_articles_v_blocks_recommended_firms" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_recommended_firms_parent_id_idx" ON "_articles_v_blocks_recommended_firms" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_recommended_firms_path_idx" ON "_articles_v_blocks_recommended_firms" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_recommended_firms_service_idx" ON "_articles_v_blocks_recommended_firms" USING btree ("service_id");
  CREATE INDEX "_articles_v_blocks_recommended_firms_locality_idx" ON "_articles_v_blocks_recommended_firms" USING btree ("locality_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_version_published_at_idx" ON "_articles_v" USING btree ("version_published_at");
  CREATE INDEX "_articles_v_version_seo_version_seo_image_idx" ON "_articles_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_texts_order_parent" ON "_articles_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_media_id_idx" ON "_articles_v_rels" USING btree ("media_id");
  CREATE INDEX "_articles_v_rels_services_id_idx" ON "_articles_v_rels" USING btree ("services_id");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_table_rows_order_idx" ON "pages_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_rows_parent_id_idx" ON "pages_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_order_idx" ON "pages_blocks_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_parent_id_idx" ON "pages_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_path_idx" ON "pages_blocks_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_table_rows_order_idx" ON "_pages_v_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_rows_parent_id_idx" ON "_pages_v_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_order_idx" ON "_pages_v_blocks_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_parent_id_idx" ON "_pages_v_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_path_idx" ON "_pages_v_blocks_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "calculators_slug_idx" ON "calculators" USING btree ("slug");
  CREATE UNIQUE INDEX "calculators_type_idx" ON "calculators" USING btree ("type");
  CREATE INDEX "calculators_linked_service_idx" ON "calculators" USING btree ("linked_service_id");
  CREATE INDEX "calculators_updated_at_idx" ON "calculators" USING btree ("updated_at");
  CREATE INDEX "calculators_created_at_idx" ON "calculators" USING btree ("created_at");
  CREATE INDEX "leads_calculator_idx" ON "leads" USING btree ("calculator_id");
  CREATE INDEX "leads_email_hash_idx" ON "leads" USING btree ("email_hash");
  CREATE INDEX "leads_retention_until_idx" ON "leads" USING btree ("retention_until");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "forum_categories_slug_idx" ON "forum_categories" USING btree ("slug");
  CREATE INDEX "forum_categories_updated_at_idx" ON "forum_categories" USING btree ("updated_at");
  CREATE INDEX "forum_categories_created_at_idx" ON "forum_categories" USING btree ("created_at");
  CREATE INDEX "forum_threads_category_idx" ON "forum_threads" USING btree ("category_id");
  CREATE UNIQUE INDEX "forum_threads_slug_idx" ON "forum_threads" USING btree ("slug");
  CREATE INDEX "forum_threads_status_idx" ON "forum_threads" USING btree ("status");
  CREATE INDEX "forum_threads_updated_at_idx" ON "forum_threads" USING btree ("updated_at");
  CREATE INDEX "forum_threads_created_at_idx" ON "forum_threads" USING btree ("created_at");
  CREATE INDEX "category_lastActivityAt_idx" ON "forum_threads" USING btree ("category_id","last_activity_at");
  CREATE INDEX "forum_threads_rels_order_idx" ON "forum_threads_rels" USING btree ("order");
  CREATE INDEX "forum_threads_rels_parent_idx" ON "forum_threads_rels" USING btree ("parent_id");
  CREATE INDEX "forum_threads_rels_path_idx" ON "forum_threads_rels" USING btree ("path");
  CREATE INDEX "forum_threads_rels_firm_accounts_id_idx" ON "forum_threads_rels" USING btree ("firm_accounts_id");
  CREATE INDEX "forum_threads_rels_staff_id_idx" ON "forum_threads_rels" USING btree ("staff_id");
  CREATE INDEX "forum_posts_thread_idx" ON "forum_posts" USING btree ("thread_id");
  CREATE INDEX "forum_posts_status_idx" ON "forum_posts" USING btree ("status");
  CREATE INDEX "forum_posts_updated_at_idx" ON "forum_posts" USING btree ("updated_at");
  CREATE INDEX "forum_posts_created_at_idx" ON "forum_posts" USING btree ("created_at");
  CREATE INDEX "forum_posts_rels_order_idx" ON "forum_posts_rels" USING btree ("order");
  CREATE INDEX "forum_posts_rels_parent_idx" ON "forum_posts_rels" USING btree ("parent_id");
  CREATE INDEX "forum_posts_rels_path_idx" ON "forum_posts_rels" USING btree ("path");
  CREATE INDEX "forum_posts_rels_firm_accounts_id_idx" ON "forum_posts_rels" USING btree ("firm_accounts_id");
  CREATE INDEX "forum_posts_rels_staff_id_idx" ON "forum_posts_rels" USING btree ("staff_id");
  CREATE INDEX "forum_posts_rels_media_id_idx" ON "forum_posts_rels" USING btree ("media_id");
  CREATE INDEX "forum_reactions_post_idx" ON "forum_reactions" USING btree ("post_id");
  CREATE INDEX "forum_reactions_account_idx" ON "forum_reactions" USING btree ("account_id");
  CREATE INDEX "forum_reactions_updated_at_idx" ON "forum_reactions" USING btree ("updated_at");
  CREATE INDEX "forum_reactions_created_at_idx" ON "forum_reactions" USING btree ("created_at");
  CREATE UNIQUE INDEX "post_account_idx" ON "forum_reactions" USING btree ("post_id","account_id");
  CREATE INDEX "listings_firm_idx" ON "listings" USING btree ("firm_id");
  CREATE INDEX "listings_locality_idx" ON "listings" USING btree ("locality_id");
  CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");
  CREATE INDEX "listings_expires_at_idx" ON "listings" USING btree ("expires_at");
  CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at");
  CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");
  CREATE INDEX "status_category_expiresAt_idx" ON "listings" USING btree ("status","category","expires_at");
  CREATE INDEX "listings_rels_order_idx" ON "listings_rels" USING btree ("order");
  CREATE INDEX "listings_rels_parent_idx" ON "listings_rels" USING btree ("parent_id");
  CREATE INDEX "listings_rels_path_idx" ON "listings_rels" USING btree ("path");
  CREATE INDEX "listings_rels_media_id_idx" ON "listings_rels" USING btree ("media_id");
  CREATE INDEX "listing_messages_listing_idx" ON "listing_messages" USING btree ("listing_id");
  CREATE INDEX "listing_messages_from_firm_idx" ON "listing_messages" USING btree ("from_firm_id");
  CREATE INDEX "listing_messages_updated_at_idx" ON "listing_messages" USING btree ("updated_at");
  CREATE INDEX "listing_messages_created_at_idx" ON "listing_messages" USING btree ("created_at");
  CREATE INDEX "reports_target_type_idx" ON "reports" USING btree ("target_type");
  CREATE INDEX "reports_target_id_idx" ON "reports" USING btree ("target_id");
  CREATE INDEX "reports_reporter_account_idx" ON "reports" USING btree ("reporter_account_id");
  CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");
  CREATE INDEX "reports_decided_by_idx" ON "reports" USING btree ("decided_by_id");
  CREATE INDEX "reports_appeal_of_idx" ON "reports" USING btree ("appeal_of_id");
  CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE INDEX "sanctions_account_idx" ON "sanctions" USING btree ("account_id");
  CREATE INDEX "sanctions_until_idx" ON "sanctions" USING btree ("until");
  CREATE INDEX "sanctions_created_by_idx" ON "sanctions" USING btree ("created_by_id");
  CREATE INDEX "sanctions_updated_at_idx" ON "sanctions" USING btree ("updated_at");
  CREATE INDEX "sanctions_created_at_idx" ON "sanctions" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_parent_idx" ON "services" USING btree ("parent_id");
  CREATE INDEX "services_seo_seo_image_idx" ON "services" USING btree ("seo_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "localities_teryt_id_idx" ON "localities" USING btree ("teryt_id");
  CREATE INDEX "localities_name_idx" ON "localities" USING btree ("name");
  CREATE INDEX "localities_type_idx" ON "localities" USING btree ("type");
  CREATE INDEX "localities_parent_idx" ON "localities" USING btree ("parent_id");
  CREATE UNIQUE INDEX "localities_slug_idx" ON "localities" USING btree ("slug");
  CREATE INDEX "localities_updated_at_idx" ON "localities" USING btree ("updated_at");
  CREATE INDEX "localities_created_at_idx" ON "localities" USING btree ("created_at");
  CREATE INDEX "media_purpose_idx" ON "media" USING btree ("purpose");
  CREATE INDEX "media_firm_idx" ON "media" USING btree ("firm_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "firm_stats_daily_firm_idx" ON "firm_stats_daily" USING btree ("firm_id");
  CREATE INDEX "firm_stats_daily_updated_at_idx" ON "firm_stats_daily" USING btree ("updated_at");
  CREATE INDEX "firm_stats_daily_created_at_idx" ON "firm_stats_daily" USING btree ("created_at");
  CREATE UNIQUE INDEX "firm_date_idx" ON "firm_stats_daily" USING btree ("firm_id","date");
  CREATE INDEX "firm_accounts_sessions_order_idx" ON "firm_accounts_sessions" USING btree ("_order");
  CREATE INDEX "firm_accounts_sessions_parent_id_idx" ON "firm_accounts_sessions" USING btree ("_parent_id");
  CREATE INDEX "firm_accounts_firm_idx" ON "firm_accounts" USING btree ("firm_id");
  CREATE INDEX "firm_accounts_updated_at_idx" ON "firm_accounts" USING btree ("updated_at");
  CREATE INDEX "firm_accounts_created_at_idx" ON "firm_accounts" USING btree ("created_at");
  CREATE UNIQUE INDEX "firm_accounts_email_idx" ON "firm_accounts" USING btree ("email");
  CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor");
  CREATE INDEX "audit_log_target_collection_idx" ON "audit_log" USING btree ("target_collection");
  CREATE INDEX "audit_log_doc_id_idx" ON "audit_log" USING btree ("doc_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE INDEX "audit_log_texts_order_parent" ON "audit_log_texts" USING btree ("order","parent_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "settings_moderation_reason_templates_order_idx" ON "settings_moderation_reason_templates" USING btree ("_order");
  CREATE INDEX "settings_moderation_reason_templates_parent_id_idx" ON "settings_moderation_reason_templates" USING btree ("_parent_id");
  CREATE INDEX "settings_texts_order_parent" ON "settings_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_firms_fk" FOREIGN KEY ("firms_id") REFERENCES "public"."firms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calculators_fk" FOREIGN KEY ("calculators_id") REFERENCES "public"."calculators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forum_categories_fk" FOREIGN KEY ("forum_categories_id") REFERENCES "public"."forum_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forum_threads_fk" FOREIGN KEY ("forum_threads_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forum_posts_fk" FOREIGN KEY ("forum_posts_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forum_reactions_fk" FOREIGN KEY ("forum_reactions_id") REFERENCES "public"."forum_reactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_messages_fk" FOREIGN KEY ("listing_messages_id") REFERENCES "public"."listing_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sanctions_fk" FOREIGN KEY ("sanctions_id") REFERENCES "public"."sanctions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_localities_fk" FOREIGN KEY ("localities_id") REFERENCES "public"."localities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_firm_stats_daily_fk" FOREIGN KEY ("firm_stats_daily_id") REFERENCES "public"."firm_stats_daily"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_firm_accounts_fk" FOREIGN KEY ("firm_accounts_id") REFERENCES "public"."firm_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_firm_accounts_fk" FOREIGN KEY ("firm_accounts_id") REFERENCES "public"."firm_accounts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_firms_id_idx" ON "payload_locked_documents_rels" USING btree ("firms_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_calculators_id_idx" ON "payload_locked_documents_rels" USING btree ("calculators_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_forum_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("forum_categories_id");
  CREATE INDEX "payload_locked_documents_rels_forum_threads_id_idx" ON "payload_locked_documents_rels" USING btree ("forum_threads_id");
  CREATE INDEX "payload_locked_documents_rels_forum_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("forum_posts_id");
  CREATE INDEX "payload_locked_documents_rels_forum_reactions_id_idx" ON "payload_locked_documents_rels" USING btree ("forum_reactions_id");
  CREATE INDEX "payload_locked_documents_rels_listings_id_idx" ON "payload_locked_documents_rels" USING btree ("listings_id");
  CREATE INDEX "payload_locked_documents_rels_listing_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("listing_messages_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_sanctions_id_idx" ON "payload_locked_documents_rels" USING btree ("sanctions_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_localities_id_idx" ON "payload_locked_documents_rels" USING btree ("localities_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_firm_stats_daily_id_idx" ON "payload_locked_documents_rels" USING btree ("firm_stats_daily_id");
  CREATE INDEX "payload_locked_documents_rels_firm_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("firm_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_rels_firm_accounts_id_idx" ON "payload_preferences_rels" USING btree ("firm_accounts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "firms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "firms_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_calculator" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_recommended_firms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_calculator" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_recommended_firms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "calculators" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_threads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_threads_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forum_reactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listing_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sanctions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "localities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "firm_stats_daily" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "firm_accounts_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "firm_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_log_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "totp_attempts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_moderation_reason_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "firms" CASCADE;
  DROP TABLE "firms_rels" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "inquiries_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "articles_blocks_text" CASCADE;
  DROP TABLE "articles_blocks_heading" CASCADE;
  DROP TABLE "articles_blocks_image" CASCADE;
  DROP TABLE "articles_blocks_gallery" CASCADE;
  DROP TABLE "articles_blocks_quote" CASCADE;
  DROP TABLE "articles_blocks_faq_items" CASCADE;
  DROP TABLE "articles_blocks_faq" CASCADE;
  DROP TABLE "articles_blocks_table_rows" CASCADE;
  DROP TABLE "articles_blocks_table" CASCADE;
  DROP TABLE "articles_blocks_cta" CASCADE;
  DROP TABLE "articles_blocks_calculator" CASCADE;
  DROP TABLE "articles_blocks_recommended_firms" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_blocks_text" CASCADE;
  DROP TABLE "_articles_v_blocks_heading" CASCADE;
  DROP TABLE "_articles_v_blocks_image" CASCADE;
  DROP TABLE "_articles_v_blocks_gallery" CASCADE;
  DROP TABLE "_articles_v_blocks_quote" CASCADE;
  DROP TABLE "_articles_v_blocks_faq_items" CASCADE;
  DROP TABLE "_articles_v_blocks_faq" CASCADE;
  DROP TABLE "_articles_v_blocks_table_rows" CASCADE;
  DROP TABLE "_articles_v_blocks_table" CASCADE;
  DROP TABLE "_articles_v_blocks_cta" CASCADE;
  DROP TABLE "_articles_v_blocks_calculator" CASCADE;
  DROP TABLE "_articles_v_blocks_recommended_firms" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_texts" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_table_rows" CASCADE;
  DROP TABLE "pages_blocks_table" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_table_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_table" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "calculators" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "forum_categories" CASCADE;
  DROP TABLE "forum_threads" CASCADE;
  DROP TABLE "forum_threads_rels" CASCADE;
  DROP TABLE "forum_posts" CASCADE;
  DROP TABLE "forum_posts_rels" CASCADE;
  DROP TABLE "forum_reactions" CASCADE;
  DROP TABLE "listings" CASCADE;
  DROP TABLE "listings_rels" CASCADE;
  DROP TABLE "listing_messages" CASCADE;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "sanctions" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "localities" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "firm_stats_daily" CASCADE;
  DROP TABLE "firm_accounts_sessions" CASCADE;
  DROP TABLE "firm_accounts" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "audit_log_texts" CASCADE;
  DROP TABLE "totp_attempts" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "settings_moderation_reason_templates" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "settings_texts" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_firms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_calculators_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forum_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forum_threads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forum_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forum_reactions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_listings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_listing_messages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reports_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sanctions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_localities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_firm_stats_daily_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_firm_accounts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_log_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_firm_accounts_fk";
  
  DROP INDEX "payload_locked_documents_rels_firms_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_inquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_calculators_id_idx";
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  DROP INDEX "payload_locked_documents_rels_forum_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_forum_threads_id_idx";
  DROP INDEX "payload_locked_documents_rels_forum_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_forum_reactions_id_idx";
  DROP INDEX "payload_locked_documents_rels_listings_id_idx";
  DROP INDEX "payload_locked_documents_rels_listing_messages_id_idx";
  DROP INDEX "payload_locked_documents_rels_reports_id_idx";
  DROP INDEX "payload_locked_documents_rels_sanctions_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_localities_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_firm_stats_daily_id_idx";
  DROP INDEX "payload_locked_documents_rels_firm_accounts_id_idx";
  DROP INDEX "payload_locked_documents_rels_audit_log_id_idx";
  DROP INDEX "payload_preferences_rels_firm_accounts_id_idx";
  ALTER TABLE "staff" DROP COLUMN "role";
  ALTER TABLE "staff" DROP COLUMN "last_login_at";
  ALTER TABLE "staff" DROP COLUMN "totp_secret";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "firms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "calculators_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forum_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forum_threads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forum_posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forum_reactions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listing_messages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reports_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sanctions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "localities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "firm_stats_daily_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "firm_accounts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_log_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "firm_accounts_id";
  DROP TYPE "public"."enum_firms_registry_source";
  DROP TYPE "public"."enum_firms_status";
  DROP TYPE "public"."enum_firms_subscription_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_inquiries_budget_range";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_source";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_articles_blocks_heading_level";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_blocks_heading_level";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_pages_blocks_heading_level";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_heading_level";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_calculators_type";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_forum_threads_status";
  DROP TYPE "public"."enum_forum_posts_status";
  DROP TYPE "public"."enum_forum_reactions_type";
  DROP TYPE "public"."enum_listings_type";
  DROP TYPE "public"."enum_listings_category";
  DROP TYPE "public"."enum_listings_condition";
  DROP TYPE "public"."enum_listings_status";
  DROP TYPE "public"."enum_reports_target_type";
  DROP TYPE "public"."enum_reports_reason";
  DROP TYPE "public"."enum_reports_status";
  DROP TYPE "public"."enum_reports_decision";
  DROP TYPE "public"."enum_sanctions_scope";
  DROP TYPE "public"."enum_sanctions_type";
  DROP TYPE "public"."enum_localities_type";
  DROP TYPE "public"."enum_media_purpose";
  DROP TYPE "public"."enum_staff_role";
  DROP TYPE "public"."enum_audit_log_actor_type";
  DROP TYPE "public"."enum_audit_log_action";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
