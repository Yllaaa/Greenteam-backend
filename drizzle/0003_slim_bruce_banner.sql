CREATE TYPE "public"."privacy" AS ENUM('PUBLIC', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."PageCategory" AS ENUM('Business', 'Project');--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"cover" varchar(255),
	"topic_id" serial NOT NULL,
	"privacy" "privacy" DEFAULT 'PRIVATE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"slug" varchar NOT NULL,
	"avatar" varchar NOT NULL,
	"cover" varchar NOT NULL,
	"topic_id" serial NOT NULL,
	"category" "PageCategory" NOT NULL,
	"page_info_id" uuid
);
--> statement-breakpoint
CREATE TABLE "pages_contacts" (
	"page_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_num" varchar NOT NULL,
	"personal_picture" varchar,
	CONSTRAINT "pages_contacts_page_id_email_pk" PRIMARY KEY("page_id","email")
);
--> statement-breakpoint
CREATE TABLE "pages_followers" (
	"page_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "pages_followers_page_id_user_id_pk" PRIMARY KEY("page_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_Users_accounts_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_owner_id_Users_accounts_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages_contacts" ADD CONSTRAINT "pages_contacts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_name_idx" ON "groups" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "page_owner" ON "pages" USING btree ("owner_id");