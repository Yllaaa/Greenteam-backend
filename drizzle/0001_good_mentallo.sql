CREATE TABLE "entities_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"parent_type" "media_parent_type" NOT NULL,
	"media_url" varchar(2048),
	"media_type" "media_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "media" CASCADE;--> statement-breakpoint
CREATE INDEX "media_parent_id_idx" ON "entities_media" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "entities_media" USING btree ("media_type");