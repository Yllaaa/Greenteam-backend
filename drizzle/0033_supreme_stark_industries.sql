CREATE TYPE "public"."language_preference" AS ENUM('en', 'es');--> statement-breakpoint
ALTER TABLE "Users_accounts" ADD COLUMN "language_preference" "language_preference" DEFAULT 'en';