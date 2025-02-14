ALTER TYPE "public"."reactionable_type" ADD VALUE 'reply' BEFORE 'forum_publication';--> statement-breakpoint
CREATE TABLE "comments_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publications_comments" DROP CONSTRAINT "publications_comments_parent_comment_id_publications_comments_id_fk";
--> statement-breakpoint
DROP INDEX "comment_parent_idx";--> statement-breakpoint
DROP INDEX "user_like_idx";--> statement-breakpoint
DROP INDEX "likeable_idx";--> statement-breakpoint
ALTER TABLE "publications_comments" ADD COLUMN "media_url" varchar;--> statement-breakpoint
ALTER TABLE "publications_reactions" ADD COLUMN "reactionable_type" "reactionable_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "publications_reactions" ADD COLUMN "reactionable_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "comments_replies" ADD CONSTRAINT "comments_replies_comment_id_publications_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."publications_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments_replies" ADD CONSTRAINT "comments_replies_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_like_idx" ON "publications_reactions" USING btree ("user_id","reactionable_type","reactionable_id");--> statement-breakpoint
CREATE INDEX "likeable_idx" ON "publications_reactions" USING btree ("reactionable_type","reactionable_id");--> statement-breakpoint
ALTER TABLE "publications_comments" DROP COLUMN "parent_comment_id";--> statement-breakpoint
ALTER TABLE "publications_reactions" DROP COLUMN "likeable_type";--> statement-breakpoint
ALTER TABLE "publications_reactions" DROP COLUMN "likeable_id";