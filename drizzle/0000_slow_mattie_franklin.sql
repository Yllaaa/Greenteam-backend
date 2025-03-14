
CREATE TABLE  IF NOT EXISTS "Users_accounts" (
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
	"group_id" uuid,
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
	"group_id" uuid,
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
	"topic_id" serial NOT NULL,
	"created_at" timestamp DEFAULT LOCALTIMESTAMP NOT NULL,
	"expires_at" timestamp,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "points_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" integer,
	"user_id" uuid,
	"points" integer NOT NULL,
	"action" "action" NOT NULL,
	"action_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" integer,
	"user_id" uuid,
	"points" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_points_user_topic_unique" UNIQUE("user_id","topic_id")
);
--> statement-breakpoint
-- ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_Users_accounts_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_Users_accounts_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_Users_accounts_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "posts" ADD CONSTRAINT "posts_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "posts" ADD CONSTRAINT "posts_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "post_sub_topics" ADD CONSTRAINT "post_sub_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "comments_replies" ADD CONSTRAINT "comments_replies_comment_id_publications_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."publications_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "comments_replies" ADD CONSTRAINT "comments_replies_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "publications_comments" ADD CONSTRAINT "publications_comments_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "publications_reactions" ADD CONSTRAINT "publications_reactions_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_main_topic_id_topics_id_fk" FOREIGN KEY ("main_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "forum_publications" ADD CONSTRAINT "forum_publications_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "events" ADD CONSTRAINT "events_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "events" ADD CONSTRAINT "events_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_joined_event" ADD CONSTRAINT "users_joined_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_Users_accounts_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "groups" ADD CONSTRAINT "groups_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "pages" ADD CONSTRAINT "pages_owner_id_Users_accounts_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "pages" ADD CONSTRAINT "pages_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "pages_contacts" ADD CONSTRAINT "pages_contacts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "pages_followers" ADD CONSTRAINT "pages_followers_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "green_challenges" ADD CONSTRAINT "green_challenges_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_do_posts" ADD CONSTRAINT "users_do_posts_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_green_challenges" ADD CONSTRAINT "users_green_challenges_challenge_id_green_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."green_challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users_green_challenges" ADD CONSTRAINT "users_green_challenges_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "points_history" ADD CONSTRAINT "points_history_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "user_points" ADD CONSTRAINT "user_points_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_Users_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS  "user_email_idx" ON "Users_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_idx" ON "Users_accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS  "topic_parent_idx" ON "topics" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_post_idx" ON "publications_comments" USING btree ("publications_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_like_idx" ON "publications_reactions" USING btree ("user_id","reactionable_type","reactionable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likeable_idx" ON "publications_reactions" USING btree ("reactionable_type","reactionable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_topic_idx" ON "forum_publications" USING btree ("main_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forum_pub_section_idx" ON "forum_publications" USING btree ("section");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "group_name_idx" ON "groups" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "page_owner" ON "pages" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_topic_idx" ON "green_challenges" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_expires_at_idx" ON "green_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "green_challenges_created_at_idx" ON "green_challenges" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_green_challenges_user_id_idx" ON "users_green_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_green_challenges_status_idx" ON "users_green_challenges" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_participant_a_idx" ON "conversations" USING btree ("participant_a_id","participant_a_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_participant_b_idx" ON "conversations" USING btree ("participant_b_id","participant_b_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_conversation_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_sender_idx" ON "chat_messages" USING btree ("sender_id","sender_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_sent_at_id_index" ON "chat_messages" USING btree ("sent_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_email_idx" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "points_history_user_topic_idx" ON "points_history" USING btree ("user_id","topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_points_user_idx" ON "user_points" USING btree ("user_id");