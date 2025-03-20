ALTER TABLE "subscription_tiers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subscription_tiers" CASCADE;--> statement-breakpoint
--ALTER TABLE "subscription_tier_benefits" DROP CONSTRAINT "subscription_tier_benefits_tier_id_subscription_tiers_id_fk";
--> statement-breakpoint
--ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_tierId_subscription_tiers_id_fk";
--> statement-breakpoint
DROP INDEX "subscription_tier_benefits_tier_id_idx";--> statement-breakpoint
DROP INDEX "users_subscriptions_tier_id_idx";--> statement-breakpoint
ALTER TABLE "subscription_tier_benefits" DROP COLUMN "tier_id";--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP COLUMN "tierId";