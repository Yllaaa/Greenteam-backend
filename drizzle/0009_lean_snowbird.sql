ALTER TABLE "groups" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "group_members" DROP COLUMN "id";
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_group_id_pk" PRIMARY KEY("user_id","group_id");--> statement-breakpoint
