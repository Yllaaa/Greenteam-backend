ALTER TABLE "notifications" ADD COLUMN "message_en" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "message_es" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "message";