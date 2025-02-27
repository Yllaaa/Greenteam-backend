
CREATE TABLE IF NOT EXISTS "Users_accounts"  (
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
CREATE TABLE IF NOT EXISTS "friend_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"status" "friend_request_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"friend_id" uuid NOT NULL,
	"since" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"main_topic_id" serial NOT NULL,
	"creator_type" "creator_type" NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_sub_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"topic_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publications_id" uuid NOT NULL,
	"publication_type" "publication_type" NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reactionable_type" "reactionable_type" NOT NULL,
	"reactionable_id" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forum_publications" (
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
CREATE TABLE IF NOT EXISTS "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"parent_type" "media_parent_type" NOT NULL,
	"media_url" varchar(2048),
	"media_type" "media_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
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
CREATE TABLE IF NOT EXISTS "users_joined_event" (
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "users_joined_event_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
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
CREATE TABLE IF NOT EXISTS "pages" (
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
CREATE TABLE IF NOT EXISTS "pages_contacts" (
	"page_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_num" varchar NOT NULL,
	"personal_picture" varchar,
	CONSTRAINT "pages_contacts_page_id_email_pk" PRIMARY KEY("page_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages_followers" (
	"page_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "pages_followers_page_id_user_id_pk" PRIMARY KEY("page_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "green_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"topic" serial NOT NULL,
	"created_at" timestamp DEFAULT LOCALTIMESTAMP NOT NULL,
	"expires_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT LOCALTIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_do_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "user_challenge_status" DEFAULT 'pending',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_green_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT LOCALTIMESTAMP NOT NULL,
	"status" "user_challenge_status" DEFAULT 'pending',
	"updated_at" timestamp DEFAULT LOCALTIMESTAMP NOT NULL,
	CONSTRAINT "unique_user_challenge" UNIQUE("user_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_members" (
	"user_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_a_id" uuid NOT NULL,
	"participant_a_type" "message_sender_type" NOT NULL,
	"participant_b_id" uuid NOT NULL,
	"participant_b_type" "message_sender_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" "message_sender_type" NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"seen_at" timestamp
);

ALTER TABLE "green_challenges" ADD CONSTRAINT "green_challenges_topic_topics_id_fk" FOREIGN KEY ("topic") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "users_green_challenges" ADD CONSTRAINT "users_green_challenges_challenge_id_green_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."green_challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_green_challenges" ADD CONSTRAINT "users_green_challenges_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "Users_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_idx" ON "Users_accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_parent_idx" ON "topics" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_post_idx" ON "publications_comments" USING btree ("publications_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_like_idx" ON "publications_reactions" USING btree ("user_id","reactionable_type","reactionable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likeable_idx" ON "publications_reactions" USING btree ("reactionable_type","reactionable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_topic_idx" ON "forum_publications" USING btree ("main_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_section_idx" ON "forum_publications" USING btree ("section");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "group_name_idx" ON "groups" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "page_owner" ON "pages" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_topic_idx" ON "green_challenges" USING btree ("topic");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_expires_at_idx" ON "green_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_created_at_idx" ON "green_challenges" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_green_challenges_user_id_idx" ON "users_green_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_green_challenges_status_idx" ON "users_green_challenges" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_participant_a_idx" ON "conversations" USING btree ("participant_a_id","participant_a_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_participant_b_idx" ON "conversations" USING btree ("participant_b_id","participant_b_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_conversation_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_sender_idx" ON "chat_messages" USING btree ("sender_id","sender_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_sent_at_id_index" ON "chat_messages" USING btree ("sent_at","id");