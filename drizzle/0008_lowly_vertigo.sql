ALTER TABLE "events" DROP CONSTRAINT "events_topic_id_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "topic_id";