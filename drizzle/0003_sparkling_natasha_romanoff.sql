ALTER TABLE "green_challenges" DROP CONSTRAINT "green_challenges_topicId_topics_id_fk";
--> statement-breakpoint
DROP INDEX "green_challenges_topic_idx";--> statement-breakpoint
ALTER TABLE "green_challenges" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "green_challenges" ADD COLUMN "topic_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "green_challenges" ADD CONSTRAINT "green_challenges_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "green_challenges_topic_idx" ON "green_challenges" USING btree ("topic_id");--> statement-breakpoint
ALTER TABLE "green_challenges" DROP COLUMN "topicId";