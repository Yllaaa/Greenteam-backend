CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp NOT NULL,
	"event_type" varchar(255),
	"metadata" json,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
