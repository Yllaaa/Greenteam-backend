import {
  pgTable,
  serial,
  integer,
  timestamp,
  pgEnum,
  uuid,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { topics, users } from '../schema';
import { relations, sql } from 'drizzle-orm';

// 'post' = 10 points
// 'comment' = 3 points
// 'like' = 1 points
// 'dislike' = 1 points
// 'sign' = 1 points
// 'challenge' = 10 points (if the user create a post about it)
// 'forum_publication' = 5 points,

export const actionEnum = pgEnum('action', [
  'post',
  'comment',
  'like',
  'dislike',
  'sign',
  'do',
  'challenge',
  'forum_publication',
]);
export type ActionType = (typeof actionEnum.enumValues)[number];

export const pointsHistory = pgTable(
  'points_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: integer('topic_id').references(() => topics.id),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    points: integer('points').notNull(),
    action: actionEnum('action').notNull(),
    actionId: uuid('action_id').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('points_history_user_topic_idx').on(table.userId, table.topicId),
  ],
);

export const userPoints = pgTable(
  'user_points',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: integer('topic_id').references(() => topics.id),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    points: integer('points').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    unique('user_points_user_topic_unique').on(table.userId, table.topicId),
    index('user_points_user_idx').on(table.userId),
  ],
);

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  user: one(users, {
    fields: [pointsHistory.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [pointsHistory.topicId],
    references: [topics.id],
  }),
}));

export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [userPoints.topicId],
    references: [topics.id],
  }),
}));
