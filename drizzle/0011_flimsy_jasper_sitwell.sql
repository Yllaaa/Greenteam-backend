ALTER TABLE "comments_replies" DROP CONSTRAINT "comments_replies_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "publications_comments" DROP CONSTRAINT "publications_comments_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "publications_reactions" DROP CONSTRAINT "publications_reactions_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "comments_replies" ADD CONSTRAINT "comments_replies_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_reactions" ADD CONSTRAINT "publications_reactions_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;