CREATE TABLE IF NOT EXISTS "Users_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"bio" varchar(255),
	"profile_picture" varchar(255),
	"phone_number" varchar(255),
	"google_id" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_token_expires" timestamp,
	"status" "USER_STATUS" DEFAULT 'ACTIVE',
	"is_email_verified" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "Users_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "Users_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_idx" ON "Users_accounts" USING btree ("username");