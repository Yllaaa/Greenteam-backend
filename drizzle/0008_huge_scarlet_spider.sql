CREATE TABLE "users_joined_event" (
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "users_joined_event_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
DROP TABLE "events_joined" CASCADE;--> statement-breakpoint
ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;