import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { posts } from '../posts/posts';
import { relations } from 'drizzle-orm';

export const topics = pgTable(
  'topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: uuid('parent_id').references(() => topics.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    parentIdx: index('topic_parent_idx').on(table.parentId),
  }),
);

export const postSubTopics = pgTable('post_sub_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  topicId: uuid('topic_id')
    .notNull()
    .references(() => topics.id),
});

export const topicsRelations = relations(topics, ({ many }) => ({
  postTopics: many(postSubTopics),
}));

export const postSubTopicsRelations = relations(postSubTopics, ({ one }) => ({
  post: one(posts, {
    fields: [postSubTopics.postId],
    references: [posts.id],
  }),
  topic: one(topics, {
    fields: [postSubTopics.topicId],
    references: [topics.id],
  }),
}));
