DROP INDEX "blocked_entity_idx";--> statement-breakpoint
DROP INDEX "reported_entity_idx";--> statement-breakpoint
ALTER TABLE "user_blocks" ADD COLUMN "blocked_type" "blocked_entity_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "user_reports" ADD COLUMN "reported_type" "reported_entity_type" NOT NULL;--> statement-breakpoint
CREATE INDEX "blocked_entity_idx" ON "user_blocks" USING btree ("blocked_id","blocked_type");--> statement-breakpoint
CREATE INDEX "reported_entity_idx" ON "user_reports" USING btree ("reported_id","reported_type");--> statement-breakpoint
ALTER TABLE "user_blocks" DROP COLUMN "blockedEntityType";--> statement-breakpoint
ALTER TABLE "user_reports" DROP COLUMN "reportedEntityType";