CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"seller_type" "seller_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_hidden" boolean DEFAULT false,
	"market_type" "market_type" NOT NULL,
	"topic_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"district_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_district_id_cities_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "seller_id_idx" ON "product" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "topic_id_idx" ON "product" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "market_type_idx" ON "product" USING btree ("market_type","is_hidden");--> statement-breakpoint
CREATE INDEX "price_idx" ON "product" USING btree ("price");--> statement-breakpoint
CREATE INDEX "product_country_id_idx" ON "product" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "product_district_id_idx" ON "product" USING btree ("district_id");