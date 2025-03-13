DROP INDEX "user_like_idx";--> statement-breakpoint
DROP INDEX "likeable_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "user_reaction_idx" ON "publications_reactions" USING btree ("user_id","reactionType","reactionable_id");--> statement-breakpoint
CREATE INDEX "reactionable_idx" ON "publications_reactions" USING btree ("reactionable_type","reactionable_id");