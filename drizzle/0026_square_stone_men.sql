ALTER TABLE "users_joined_event" DROP CONSTRAINT "users_joined_event_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;