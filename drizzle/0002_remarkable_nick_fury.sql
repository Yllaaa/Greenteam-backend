ALTER TABLE "public"."entities_media" ALTER COLUMN "media_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."media_type";--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'document', 'audio');--> statement-breakpoint
ALTER TABLE "public"."entities_media" ALTER COLUMN "media_type" SET DATA TYPE "public"."media_type" USING "media_type"::"public"."media_type";