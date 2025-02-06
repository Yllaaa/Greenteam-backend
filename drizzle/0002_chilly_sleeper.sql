CREATE TYPE "public"."media_parent_type" AS ENUM('post', 'comment', 'forum-question', 'product');--> statement-breakpoint
CREATE TYPE "public"."forum_sections" AS ENUM('doubt', 'need', 'dream');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forum_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"headline" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"main_topic_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"section" "forum_sections" NOT NULL,
	"media_url" varchar(2048),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publications_comments" ADD COLUMN "publication_type" "publication_type" NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_topic_idx" ON "forum_publications" USING btree ("main_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_section_idx" ON "forum_publications" USING btree ("section");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications_reactions" ADD CONSTRAINT "publications_reactions_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "media_url";