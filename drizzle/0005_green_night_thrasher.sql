CREATE TYPE "public"."event_mode" AS ENUM('online', 'local');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "mode" "event_mode" DEFAULT 'online' NOT NULL;--> statement-breakpoint
CREATE INDEX "events_mode_idx" ON "events" USING btree ("mode");