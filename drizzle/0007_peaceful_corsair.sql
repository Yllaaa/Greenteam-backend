DROP INDEX "page_owner";--> statement-breakpoint
CREATE UNIQUE INDEX "page_slug_idx" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "page_owner_id_idx" ON "pages" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "page_country_idx" ON "pages" USING btree ("country_id");