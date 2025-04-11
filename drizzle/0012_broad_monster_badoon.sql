ALTER TABLE "points_history" DROP CONSTRAINT "points_history_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "user_points" DROP CONSTRAINT "user_points_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;