CREATE TYPE "public"."publication_type" AS ENUM('post', 'forum-question');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike', 'do', 'sign');--> statement-breakpoint
CREATE TYPE "public"."reactionable_type" AS ENUM('post', 'comment', 'forum-question');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publications_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"likeable_type" "reactionable_type" NOT NULL,
	"likeable_id" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "shared_posts";--> statement-breakpoint
DROP TABLE "comments";--> statement-breakpoint
DROP TABLE "likes";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_publications_id_posts_id_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_parent_comment_id_publications_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."publications_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_post_idx" ON "publications_comments" USING btree ("publications_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pub_comment_hierarchy_idx" ON "publications_comments" USING btree ("publications_id","parent_comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_like_idx" ON "publications_reactions" USING btree ("user_id","likeable_type","likeable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likeable_idx" ON "publications_reactions" USING btree ("likeable_type","likeable_id");--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
DROP TYPE "public"."likeable_type";--> statement-breakpoint
DROP TYPE "public"."media_parent_type";--> statement-breakpoint
DROP TYPE "public"."post_type";--> statement-breakpoint
DROP TYPE "public"."shared_entity_type";