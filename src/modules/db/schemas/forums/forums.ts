import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  pgEnum,
  serial,
} from 'drizzle-orm/pg-core';
import {
  entitiesMedia,
  publicationsComments,
  publicationsReactions,
  topics,
  users,
} from '../schema';
import { relations } from 'drizzle-orm';

export const publicationsStatus = pgEnum('publications_status', [
  'draft',
  'published',
  'hidden',
]);

export const forumSections = pgEnum('forum_sections', [
  'doubt',
  'need',
  'dream',
]);

export const forumPublications = pgTable(
  'forum_publications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    headline: varchar('headline', { length: 255 }).notNull(),
    content: text('content').notNull(),
    mainTopicId: serial('main_topic_id')
      .references(() => topics.id)
      .notNull(),
    authorId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    section: forumSections().notNull(),
    status: publicationsStatus().default('published'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    topicIdx: index('forum_pub_topic_idx').on(table.mainTopicId),
    sectionIdx: index('forum_pub_section_idx').on(table.section),
  }),
);

export const forumsPublicationsRelations = relations(
  forumPublications,
  ({ one, many }) => ({
    author: one(users, {
      fields: [forumPublications.authorId],
      references: [users.id],
    }),
    mainTopic: one(topics, {
      fields: [forumPublications.mainTopicId],
      references: [topics.id],
    }),
    comments: many(publicationsComments),
    reactions: many(publicationsReactions),
    media: many(entitiesMedia),
  }),
);
