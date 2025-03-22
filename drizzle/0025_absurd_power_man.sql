CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer,
	"name_en" varchar(100) NOT NULL,
	"name_es" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_es" varchar(100) NOT NULL,
	"iso" varchar(2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "district" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "country" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "district" CASCADE;--> statement-breakpoint
DROP TABLE "country" CASCADE;--> statement-breakpoint
--ALTER TABLE "product" DROP CONSTRAINT "product_country_id_country_id_fk";
--> statement-breakpoint
--ALTER TABLE "product" DROP CONSTRAINT "product_district_id_district_id_fk";
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "district_country_id_idx" ON "cities" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "district_name_en_idx" ON "cities" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "district_name_es_idx" ON "cities" USING btree ("name_es");--> statement-breakpoint
CREATE INDEX "country_name_en_idx" ON "countries" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "country_name_es_idx" ON "countries" USING btree ("name_es");--> statement-breakpoint
CREATE INDEX "country_iso_idx" ON "countries" USING btree ("iso");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_district_id_cities_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;