CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"bio" varchar(255),
	"profile_picture" varchar(255) DEFAULT 'https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png',
	"phone_number" varchar(255) NOT NULL,
	"password_reset_token" varchar(255),
	"password_reset_token_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "users" USING btree ("email");