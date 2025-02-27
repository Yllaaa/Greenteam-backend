import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  serial,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users';
import { posts } from '../schema';
import { relations, sql } from 'drizzle-orm';
import { topics } from '../schema';
export const userChallengeStatus = pgEnum('user_challenge_status', [
  'pending',
  'done',
  'rejected',
]);

export const greenChallenges = pgTable(
  'green_challenges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 256 }).notNull(),
    description: text('description').notNull(),
    topicId: serial('topic_id')
      .references(() => topics.id)
      .notNull(),
    createdAt: timestamp('created_at')
      .default(sql`LOCALTIMESTAMP`)
      .notNull(),
    expiresAt: timestamp('expires_at'),
    updatedAt: timestamp('updated_at')
      .default(sql`LOCALTIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      topicIdx: index('green_challenges_topic_idx').on(table.topicId),
      expiresAtIdx: index('green_challenges_expires_at_idx').on(
        table.expiresAt,
      ),
      createdAtIdx: index('green_challenges_created_at_idx').on(
        table.createdAt,
      ),
    };
  },
);

export const greenChallengesRelations = relations(
  greenChallenges,
  ({ one }) => ({
    topic: one(topics, {
      fields: [greenChallenges.topicId],
      references: [topics.id],
    }),
  }),
);

export const usersGreenChallenges = pgTable(
  'users_green_challenges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    challengeId: uuid('challenge_id')
      .notNull()
      .references(() => greenChallenges.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`LOCALTIMESTAMP`)
      .notNull(),
    status: userChallengeStatus('status').default('pending'),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .default(sql`LOCALTIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('users_green_challenges_user_id_idx').on(table.userId),
      statusIdx: index('users_green_challenges_status_idx').on(table.status),
      uniqueUserChallenge: unique('unique_user_challenge').on(
        table.userId,
        table.challengeId,
      ),
    };
  },
);

export const usersGreenChallengesRelations = relations(
  usersGreenChallenges,
  ({ one }) => ({
    challenge: one(greenChallenges, {
      fields: [usersGreenChallenges.challengeId],
      references: [greenChallenges.id],
    }),
    user: one(users, {
      fields: [usersGreenChallenges.userId],
      references: [users.id],
    }),
  }),
);

export const usersDoPosts = pgTable('users_do_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: userChallengeStatus().default('pending'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersDoPostsRelations = relations(usersDoPosts, ({ one }) => ({
  post: one(posts, {
    fields: [usersDoPosts.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [usersDoPosts.userId],
    references: [users.id],
  }),
}));
