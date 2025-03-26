DROP INDEX "user_reaction_idx";--> statement-breakpoint
ALTER TABLE "publications_reactions" ADD COLUMN "reaction_type" "reaction_type";--> statement-breakpoint
CREATE UNIQUE INDEX "user_reaction_idx" ON "publications_reactions" USING btree ("user_id","reaction_type","reactionable_id");--> statement-breakpoint
ALTER TABLE "publications_reactions" DROP COLUMN "reactionType";