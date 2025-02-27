ALTER TABLE "green_challenges" DROP CONSTRAINT "green_challenges_topic_topics_id_fk";
--> statement-breakpoint
DROP INDEX "green_challenges_topic_idx";--> statement-breakpoint
ALTER TABLE "green_challenges" ADD COLUMN "topicId" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "green_challenges" ADD CONSTRAINT "green_challenges_topicId_topics_id_fk" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "green_challenges_topic_idx" ON "green_challenges" USING btree ("topicId");--> statement-breakpoint
ALTER TABLE "green_challenges" DROP COLUMN "topic";