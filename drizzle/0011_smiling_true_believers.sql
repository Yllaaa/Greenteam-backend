DROP TABLE "subscriptions_invoice" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions_payments" CASCADE;--> statement-breakpoint
ALTER TABLE "Users_accounts" ADD COLUMN "stripe_customer_id" varchar(255);