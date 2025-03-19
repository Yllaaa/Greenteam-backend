CREATE TABLE "subscription_benefits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benefit" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_tier_benefits" (
	"tier_id" uuid NOT NULL,
	"benefit_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_tier_benefits" ADD CONSTRAINT "subscription_tier_benefits_tier_id_subscription_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_tier_benefits" ADD CONSTRAINT "subscription_tier_benefits_benefit_id_subscription_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."subscription_benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_tier_benefits_tier_id_idx" ON "subscription_tier_benefits" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "subscription_tier_benefits_benefit_id_idx" ON "subscription_tier_benefits" USING btree ("benefit_id");--> statement-breakpoint
CREATE INDEX "subscription_tiers_name_idx" ON "subscription_tiers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "subscriptions_invoice_payment_id_idx" ON "subscriptions_invoice" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "subscriptions_invoice_user_id_idx" ON "subscriptions_invoice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_subscription_id_idx" ON "subscriptions_payments" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_stripe_id_idx" ON "subscriptions_payments" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_status_idx" ON "subscriptions_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_subscriptions_user_id_idx" ON "users_subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "users_subscriptions_tier_id_idx" ON "users_subscriptions" USING btree ("tierId");--> statement-breakpoint
CREATE INDEX "users_subscriptions_status_idx" ON "users_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_subscriptions_stripe_id_idx" ON "users_subscriptions" USING btree ("stripe_subscription_id");