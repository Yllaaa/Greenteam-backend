CREATE TABLE "followers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"since" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follower_not_self" CHECK ("followers"."follower_id" <> "followers"."following_id")
);
--> statement-breakpoint
DROP TABLE "friend_requests" CASCADE;--> statement-breakpoint
DROP TABLE "friends" CASCADE;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_Users_accounts_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_Users_accounts_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "followers_followerId_followingId_unique" ON "followers" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "followers_followerId_idx" ON "followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "followers_followingId_idx" ON "followers" USING btree ("following_id");--> statement-breakpoint
DROP TYPE "public"."friend_request_status";