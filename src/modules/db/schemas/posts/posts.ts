import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  serial,
} from 'drizzle-orm/pg-core';
import { creatorTypeEnum } from './enums';
import { users } from '../users/users';
import { relations } from 'drizzle-orm';
import { postSubTopics, topics } from '../topics/topics';
import { publicationsComments, publicationsReactions } from './comments-likes';
import { groups } from '../groups/groups';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content'),
  mainTopicId: serial('main_topic_id')
    .references(() => topics.id)
    .notNull(),
  creatorType: creatorTypeEnum('creator_type').notNull(),
  creatorId: uuid('creator_id').notNull(),
  groupId: uuid('group_id').references(() => groups.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many, one }) => ({
  mainTopic: one(topics, {
    fields: [posts.mainTopicId],
    references: [topics.id],
  }),
  subTopics: many(postSubTopics),
  user_creator: one(users, {
    fields: [posts.creatorId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
  comments: many(publicationsComments),
  reactions: many(publicationsReactions),
}));