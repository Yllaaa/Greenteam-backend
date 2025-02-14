import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  serial,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users';
import { posts } from '../schema';
import { relations } from 'drizzle-orm';

export const userChallengeStatus = pgEnum('user_challenge_status', [
  'pending',
  'done',
  'rejected',
]);

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
