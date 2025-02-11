CREATE TYPE "public"."Event Category" AS ENUM('social', 'volunteering&work', 'talks&workshops');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"parent_type" "media_parent_type" NOT NULL,
	"media_url" varchar(2048),
	"media_type" "media_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"creator_type" "creator_type" NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"location" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"category" "Event Category" NOT NULL,
	"poster" varchar,
	"priority" smallint DEFAULT 0 NOT NULL,
	"topic_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events_joined" (
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "events_joined_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_joined" ADD CONSTRAINT "events_joined_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_joined" ADD CONSTRAINT "events_joined_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;