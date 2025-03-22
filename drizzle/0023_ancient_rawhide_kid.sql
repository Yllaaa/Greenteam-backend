CREATE TYPE "public"."market_type" AS ENUM('local_business', 'value_driven_business', 'second_hand');--> statement-breakpoint
CREATE TYPE "public"."seller_type" AS ENUM('user', 'page');--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL,
	"seller_type" "seller_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"is_hidden" boolean DEFAULT false,
	"market_type" "market_type",
	"topic_id" integer,
	"country_iso" char(2),
	"district" varchar(100)
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "seller_id_idx" ON "product" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "topic_id_idx" ON "product" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "location_idx" ON "product" USING btree ("country_iso","district");--> statement-breakpoint
CREATE INDEX "market_type_idx" ON "product" USING btree ("market_type","is_hidden");--> statement-breakpoint
CREATE INDEX "price_idx" ON "product" USING btree ("price");