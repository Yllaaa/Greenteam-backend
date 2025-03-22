ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_userId_Users_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_tierId_subscription_tiers_id_fk";
--> statement-breakpoint
DROP INDEX "users_subscriptions_user_id_idx";--> statement-breakpoint
DROP INDEX "users_subscriptions_tier_id_idx";--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD COLUMN "tier_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_tier_id_subscription_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_subscriptions_user_id_idx" ON "users_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_subscriptions_tier_id_idx" ON "users_subscriptions" USING btree ("tier_id");--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP COLUMN "tierId";