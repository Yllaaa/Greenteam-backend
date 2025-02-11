ALTER TABLE "events" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "createdAt" date DEFAULT now() NOT NULL;