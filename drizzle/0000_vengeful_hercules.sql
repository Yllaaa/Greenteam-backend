CREATE TYPE "public"."USER_STATUS" AS ENUM('ACTIVE', 'DEACTIVATED', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."creator_type" AS ENUM('user', 'page', 'group_member');--> statement-breakpoint
CREATE TYPE "public"."likeable_type" AS ENUM('post', 'comment', 'event', 'product', 'news');--> statement-breakpoint
CREATE TYPE "public"."media_parent_type" AS ENUM('post', 'message');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('post', 'poll', 'shared');--> statement-breakpoint
CREATE TYPE "public"."shared_entity_type" AS ENUM('post', 'product', 'news', 'event');--> statement-breakpoint
CREATE TYPE "public"."visibility_level" AS ENUM('only_me', 'friends', 'public');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"bio" varchar(255),
	"profile_picture" varchar(255),
	"phone_number" varchar(255),
	"google_id" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_token_expires" timestamp,
	"status" "USER_STATUS" DEFAULT 'ACTIVE',
	"is_email_verified" boolean DEFAULT false,
	"verification_token" varchar(255),
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "Users_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "post_type" DEFAULT 'post' NOT NULL,
	"content" text,
	"main_topic_id" uuid NOT NULL,
	"creator_type" "creator_type" NOT NULL,
	"creator_id" uuid NOT NULL,
	"media_url" varchar(2048),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"shared_entity_type" "shared_entity_type" NOT NULL,
	"shared_entity_id" uuid NOT NULL,
	"content" text,
	"shared_by_type" "creator_type" NOT NULL,
	"shared_by_id" uuid NOT NULL,
	"shared_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shared_posts_post_id_unique" UNIQUE("post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_sub_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"likeable_type" "likeable_type" NOT NULL,
	"likeable_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_posts" ADD CONSTRAINT "shared_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "Users_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_idx" ON "Users_accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shared_entity_idx" ON "shared_posts" USING btree ("shared_entity_type","shared_entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_parent_idx" ON "topics" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_post_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_parent_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_like_idx" ON "likes" USING btree ("user_id","likeable_type","likeable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likeable_idx" ON "likes" USING btree ("likeable_type","likeable_id");