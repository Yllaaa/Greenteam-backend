ALTER TABLE "public"."notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."interaction_type";--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('reaction', 'comment', 'reply', 'followed_user', 'followed_page', 'joined_group', 'joined_event');--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "type" SET DATA TYPE "public"."interaction_type" USING "type"::"public"."interaction_type";