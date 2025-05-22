CREATE TABLE "users_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"country_id" integer NOT NULL,
	"city_id" integer,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_locations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users_locations" ADD CONSTRAINT "users_locations_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_locations" ADD CONSTRAINT "users_locations_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_locations" ADD CONSTRAINT "users_locations_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_locations_country_id_idx" ON "users_locations" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "users_locations_city_id_idx" ON "users_locations" USING btree ("city_id");