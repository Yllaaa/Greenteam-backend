CREATE TYPE "public"."event_category" AS ENUM('social', 'volunteering&work', 'talks&workshops');
--> statement-breakpoint
CREATE TYPE "public"."event_hosted_by" AS ENUM('Global', 'Greenteam', 'user');
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" SET DATA TYPE event_category USING category::text::event_category;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "hostedBy" "event_hosted_by";
--> statement-breakpoint
DROP TYPE "public"."Event Category";