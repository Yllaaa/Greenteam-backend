CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "subscriptions_invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_invoice_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"pdf_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriptionId" uuid NOT NULL,
	"stripe_payment_id" text NOT NULL,
	"status" "payment_status" NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions_invoice" ADD CONSTRAINT "subscriptions_invoice_payment_id_subscriptions_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."subscriptions_payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_invoice" ADD CONSTRAINT "subscriptions_invoice_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_payments" ADD CONSTRAINT "subscriptions_payments_subscriptionId_users_subscriptions_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."users_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_invoice_payment_id_idx" ON "subscriptions_invoice" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "subscriptions_invoice_user_id_idx" ON "subscriptions_invoice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_subscription_id_idx" ON "subscriptions_payments" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_stripe_id_idx" ON "subscriptions_payments" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "subscriptions_payments_status_idx" ON "subscriptions_payments" USING btree ("status");