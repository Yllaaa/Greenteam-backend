CREATE TYPE "public"."USER_STATUS" AS ENUM('ACTIVE', 'DEACTIVATED', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."creator_type" AS ENUM('user', 'page', 'group_member');--> statement-breakpoint
CREATE TYPE "public"."media_parent_type" AS ENUM('post', 'comment', 'forum_publication', 'product');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."publication_type" AS ENUM('post', 'forum_publication');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike', 'do', 'sign');--> statement-breakpoint
CREATE TYPE "public"."reactionable_type" AS ENUM('post', 'comment', 'forum_publication');--> statement-breakpoint
CREATE TYPE "public"."visibility_level" AS ENUM('only_me', 'friends', 'public');--> statement-breakpoint
CREATE TYPE "public"."forum_sections" AS ENUM('doubt', 'need', 'dream');--> statement-breakpoint
CREATE TYPE "public"."publications_status" AS ENUM('draft', 'published', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."Event Category" AS ENUM('social', 'volunteering&work', 'talks&workshops');--> statement-breakpoint
CREATE TABLE "Users_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"bio" varchar(255),
	"profile_picture" varchar(255),
	"phone_number" varchar(255),
	"google_id" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_token_expires" timestamp,
	"status" "USER_STATUS" DEFAULT 'ACTIVE',
	"is_email_verified" boolean DEFAULT false,
	"verification_token" varchar(255),
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "Users_accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "Users_accounts_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"main_topic_id" serial NOT NULL,
	"creator_type" "creator_type" NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_sub_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"topic_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publications_id" uuid NOT NULL,
	"publication_type" "publication_type" NOT NULL,
	"parent_comment_id" uuid,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"likeable_type" "reactionable_type" NOT NULL,
	"likeable_id" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"headline" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"main_topic_id" serial NOT NULL,
	"user_id" uuid NOT NULL,
	"section" "forum_sections" NOT NULL,
	"media_url" varchar(2048),
	"status" "publications_status" DEFAULT 'published',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"parent_type" "media_parent_type" NOT NULL,
	"media_url" varchar(2048),
	"media_type" "media_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"creator_type" "creator_type" NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"location" varchar NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"category" "Event Category",
	"poster" varchar,
	"priority" smallint DEFAULT 0 NOT NULL,
	"topic_id" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_joined_event" (
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "users_joined_event_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_publications_id_posts_id_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_parent_comment_id_publications_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."publications_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_reactions" ADD CONSTRAINT "publications_reactions_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "Users_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_idx" ON "Users_accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX "topic_parent_idx" ON "topics" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "comment_post_idx" ON "publications_comments" USING btree ("publications_id");--> statement-breakpoint
CREATE INDEX "comment_parent_idx" ON "publications_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_like_idx" ON "publications_reactions" USING btree ("user_id","likeable_type","likeable_id");--> statement-breakpoint
CREATE INDEX "likeable_idx" ON "publications_reactions" USING btree ("likeable_type","likeable_id");--> statement-breakpoint
CREATE INDEX "forum_pub_topic_idx" ON "forum_publications" USING btree ("main_topic_id");--> statement-breakpoint
CREATE INDEX "forum_pub_section_idx" ON "forum_publications" USING btree ("section");