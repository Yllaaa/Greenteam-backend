ALTER TABLE "pages_contacts" DROP CONSTRAINT "pages_contacts_page_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "pages_followers" DROP CONSTRAINT "pages_followers_page_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "pages_followers" DROP CONSTRAINT "pages_followers_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "pages_contacts" ADD CONSTRAINT "pages_contacts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;