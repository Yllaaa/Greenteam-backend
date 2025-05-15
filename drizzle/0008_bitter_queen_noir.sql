CREATE TYPE "public"."account_type" AS ENUM('normal', 'sponsor');--> statement-breakpoint
ALTER TABLE "Users_accounts" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Users_accounts" ADD COLUMN "account_type" "account_type" DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "updated_at" timestamp DEFAULT now();