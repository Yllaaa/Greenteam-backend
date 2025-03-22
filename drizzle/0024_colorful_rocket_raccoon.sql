CREATE TABLE "district" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer,
	"name_en" varchar(100) NOT NULL,
	"name_es" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "country" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_es" varchar(100) NOT NULL,
	"iso" varchar(2) NOT NULL
);
--> statement-breakpoint
DROP INDEX "location_idx";--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "country_id" integer;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "district_id" integer;--> statement-breakpoint
ALTER TABLE "district" ADD CONSTRAINT "district_country_id_country_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "district_country_id_idx" ON "district" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "district_name_en_idx" ON "district" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "district_name_es_idx" ON "district" USING btree ("name_es");--> statement-breakpoint
CREATE INDEX "country_name_en_idx" ON "country" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "country_name_es_idx" ON "country" USING btree ("name_es");--> statement-breakpoint
CREATE INDEX "country_iso_idx" ON "country" USING btree ("iso");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_country_id_country_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_district_id_district_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."district"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_country_id_idx" ON "product" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "product_district_id_idx" ON "product" USING btree ("district_id");--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "country_iso";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "district";