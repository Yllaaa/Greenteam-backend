CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired', 'pending');--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_userId_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_tierId_subscription_tiers_id_fk";
--> statement-breakpoint
ALTER TABLE "users_subscriptions" ALTER COLUMN "status" SET DATA TYPE subscription_status USING status::subscription_status;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_userId_Users_accounts_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_tierId_subscription_tiers_id_fk" FOREIGN KEY ("tierId") REFERENCES "public"."subscription_tiers"("id") ON DELETE cascade ON UPDATE no action;