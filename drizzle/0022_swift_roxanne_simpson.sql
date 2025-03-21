CREATE TABLE "stripe_event_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"object_id" text,
	"object_type" text,
	"status" text,
	"raw_data" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
