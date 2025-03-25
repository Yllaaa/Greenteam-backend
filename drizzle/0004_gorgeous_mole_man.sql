ALTER TABLE "users_do_posts" DROP CONSTRAINT "users_do_posts_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "users_do_posts" DROP CONSTRAINT "users_do_posts_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;