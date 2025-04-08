ALTER TABLE "events" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "hosted_by" "event_hosted_by";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "poster_url" varchar;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "events_creator_id_idx" ON "events" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_group_id_idx" ON "events" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "hostedBy";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "poster";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "createdAt";