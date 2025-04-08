ALTER TABLE "groups" ADD COLUMN "banner" varchar(255);--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN "cover";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN "privacy";