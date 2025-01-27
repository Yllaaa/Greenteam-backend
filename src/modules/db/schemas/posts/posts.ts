import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import {
  postTypeEnum,
  visibilityLevelEnum,
  creatorTypeEnum,
  mediaParentTypeEnum,
} from './enums';
import { users } from '../users/users';
import { relations } from 'drizzle-orm';
import { polls } from './polls';
import { postSubTopics, topics } from '../topics/topics';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: postTypeEnum('type').notNull().default('post'),
  content: text('content'),
  mainTopicId: uuid('main_topic_id')
    .references(() => topics.id)
    .notNull(),
  visibilityLevel: visibilityLevelEnum('visibility_level').notNull(),
  creatorType: creatorTypeEnum('creator_type').notNull(),
  creatorId: uuid('creator_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentType: mediaParentTypeEnum('parent_type').notNull(),
  parentId: uuid('parent_id').notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  mediaSize: varchar('media_size', { length: 255 }).notNull(),
  durationMinutes: varchar('duration_minutes', { length: 255 }), // Only for videos
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many, one }) => ({
  polls: one(polls),
  media: many(media),
  subTopics: many(postSubTopics),
  user_creator: one(users, {
    fields: [posts.creatorId],
    references: [users.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  post: one(posts, {
    fields: [media.parentId],
    references: [posts.id],
  }),
}));
