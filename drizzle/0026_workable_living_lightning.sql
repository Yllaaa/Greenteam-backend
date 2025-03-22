DROP INDEX "district_country_id_idx";--> statement-breakpoint
DROP INDEX "district_name_en_idx";--> statement-breakpoint
DROP INDEX "district_name_es_idx";--> statement-breakpoint
CREATE INDEX "cities_country_id_idx" ON "cities" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "cities_name_en_idx" ON "cities" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "cities_name_es_idx" ON "cities" USING btree ("name_es");