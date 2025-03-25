ALTER TABLE "post_sub_topics" DROP CONSTRAINT "post_sub_topics_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "post_sub_topics" DROP CONSTRAINT "post_sub_topics_topic_id_topics_id_fk";
--> statement-breakpoint
DROP INDEX "user_reaction_idx";--> statement-breakpoint
--ALTER TABLE "publications_reactions" ADD COLUMN "reaction_type" "reaction_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_reaction_idx" ON "publications_reactions" USING btree ("user_id","reaction_type","reactionable_id");--> statement-breakpoint
--ALTER TABLE "publications_reactions" DROP COLUMN "reactionType";