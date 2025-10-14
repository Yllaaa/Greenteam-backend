import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  foreignKey,
  index,
  serial,
  integer,
} from 'drizzle-orm/pg-core';
import { posts } from '../posts/posts';
import { relations } from 'drizzle-orm';
import { userPoints } from '../schema';

export const topics = pgTable(
  'topics',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: integer('parent_id').references(() => topics.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('topic_parent_idx').on(table.parentId)],
);

export const postSubTopics = pgTable('post_sub_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  topicId: serial('topic_id')
    .notNull()
    .references(() => topics.id, { onDelete: 'cascade' }),
});

export const topicsRelations = relations(topics, ({ many, one }) => ({
  postTopics: many(postSubTopics),
  parent: one(topics, {
    fields: [topics.parentId],
    references: [topics.id],
  }),
  children: many(topics),
  userPoints: many(userPoints),
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
