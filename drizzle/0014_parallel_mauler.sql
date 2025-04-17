CREATE TYPE "public"."blocked_entity_type" AS ENUM('user', 'page');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."reported_entity_type" AS ENUM('user', 'page', 'post', 'group', 'forum_publication', 'comment', 'product', 'event');--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"blockedEntityType" "blocked_entity_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_blocks_blocker_id_blocked_id_unique" UNIQUE("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reported_id" uuid NOT NULL,
	"reportedEntityType" "reported_entity_type" NOT NULL,
	"reason" text NOT NULL,
	"admin_notes" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_Users_accounts_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reporter_id_Users_accounts_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocker_idx" ON "user_blocks" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "blocked_entity_idx" ON "user_blocks" USING btree ("blocked_id","blockedEntityType");--> statement-breakpoint
CREATE INDEX "reporter_idx" ON "user_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reported_entity_idx" ON "user_reports" USING btree ("reported_id","reportedEntityType");