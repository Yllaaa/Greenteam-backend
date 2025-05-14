CREATE TYPE "public"."market_type" AS ENUM('local', 'online');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "market_type" "market_type" DEFAULT 'online' NOT NULL;--> statement-breakpoint
CREATE INDEX "product_market_type_idx" ON "products" USING btree ("market_type","is_hidden");