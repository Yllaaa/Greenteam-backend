import {
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations, sql } from 'drizzle-orm';

export const followers = pgTable(
  'followers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id),
    followingId: uuid('following_id')
      .notNull()
      .references(() => users.id),
    since: timestamp('since').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('followers_followerId_followingId_unique').on(
      t.followerId,
      t.followingId,
    ),
    index('followers_followerId_idx').on(t.followerId),
    index('followers_followingId_idx').on(t.followingId),
    check('follower_not_self', sql`${t.followerId} <> ${t.followingId}`),
  ],
);

export const FollowersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
  }),
}));
