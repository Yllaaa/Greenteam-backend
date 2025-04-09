CREATE TABLE "group_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"creator_id" uuid,
	"title" varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "group_notes" ADD CONSTRAINT "group_notes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_notes" ADD CONSTRAINT "group_notes_creator_id_Users_accounts_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_note_idx" ON "group_notes" USING btree ("title");