ALTER TABLE "friends" DROP CONSTRAINT "friends_user_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "friends" DROP CONSTRAINT "friends_friend_id_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "friends" ADD COLUMN "user_one_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "friends" ADD COLUMN "user_two_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_one_id_Users_accounts_id_fk" FOREIGN KEY ("user_one_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_two_id_Users_accounts_id_fk" FOREIGN KEY ("user_two_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "friends" DROP COLUMN "friend_id";