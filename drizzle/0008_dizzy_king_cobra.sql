ALTER TABLE "pages_contacts" DROP CONSTRAINT "pages_contacts_page_id_email_pk";--> statement-breakpoint
ALTER TABLE "pages_contacts" ALTER COLUMN "name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "pages_contacts" ALTER COLUMN "title" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "pages_contacts" ALTER COLUMN "email" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "pages_contacts" ALTER COLUMN "phone_num" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "pages_contacts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX "contact_page_id_idx" ON "pages_contacts" USING btree ("page_id");--> statement-breakpoint
ALTER TABLE "pages_contacts" DROP COLUMN "personal_picture";