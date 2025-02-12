CREATE TYPE "public"."user_challenge_status" AS ENUM('pending', 'done', 'rejected');--> statement-breakpoint
CREATE TABLE "users_do_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "user_challenge_status" DEFAULT 'pending',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;