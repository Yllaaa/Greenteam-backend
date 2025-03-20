CREATE TABLE "subscription_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"stripe_product_id" text,
	"stripe_price_id" text
);
--> statement-breakpoint
ALTER TABLE "subscription_tier_benefits" ADD COLUMN "tier_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD COLUMN "tierId" integer NOT NULL;--> statement-breakpoint
CREATE INDEX "subscription_tiers_name_idx" ON "subscription_tiers" USING btree ("name");--> statement-breakpoint
ALTER TABLE "subscription_tier_benefits" ADD CONSTRAINT "subscription_tier_benefits_tier_id_subscription_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_tierId_subscription_tiers_id_fk" FOREIGN KEY ("tierId") REFERENCES "public"."subscription_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_tier_benefits_tier_id_idx" ON "subscription_tier_benefits" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "users_subscriptions_tier_id_idx" ON "users_subscriptions" USING btree ("tierId");