DROP INDEX "subscription_tiers_name_idx";--> statement-breakpoint
ALTER TABLE "subscription_benefits" ADD COLUMN "benefit_en" text;--> statement-breakpoint
ALTER TABLE "subscription_benefits" ADD COLUMN "benefit_es" text;--> statement-breakpoint
ALTER TABLE "subscription_tiers" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "subscription_tiers" ADD COLUMN "name_es" text;--> statement-breakpoint
CREATE INDEX "subscription_tiers_name_idx" ON "subscription_tiers" USING btree ("name_en");--> statement-breakpoint
ALTER TABLE "subscription_benefits" DROP COLUMN "benefit";--> statement-breakpoint
ALTER TABLE "subscription_tiers" DROP COLUMN "name";