DROP TYPE "public"."media_parent_type";--> statement-breakpoint
CREATE TYPE "public"."media_parent_type" AS ENUM('post', 'comment', 'forum_publication', 'product');--> statement-breakpoint
ALTER TABLE "public"."publications_comments" ALTER COLUMN "publication_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."publication_type";--> statement-breakpoint
CREATE TYPE "public"."publication_type" AS ENUM('post', 'forum_publication');--> statement-breakpoint
ALTER TABLE "public"."publications_comments" ALTER COLUMN "publication_type" SET DATA TYPE "public"."publication_type" USING "publication_type"::"public"."publication_type";--> statement-breakpoint
ALTER TABLE "public"."publications_reactions" ALTER COLUMN "likeable_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."reactionable_type";--> statement-breakpoint
CREATE TYPE "public"."reactionable_type" AS ENUM('post', 'comment', 'forum_publication');--> statement-breakpoint
ALTER TABLE "public"."publications_reactions" ALTER COLUMN "likeable_type" SET DATA TYPE "public"."reactionable_type" USING "likeable_type"::"public"."reactionable_type";