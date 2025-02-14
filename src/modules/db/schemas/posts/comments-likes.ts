import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  serial,
} from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { relations } from 'drizzle-orm';
import {
  publicationTypeEnum,
  reactionableTypeEnum,
  reactionTypeEnum,
} from './enums';
import { users } from '../schema';

export const publicationsComments = pgTable(
  'publications_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicationId: uuid('publications_id')
      .references(() => posts.id, { onDelete: 'cascade' })
      .notNull(),
    publicationType: publicationTypeEnum('publication_type').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    mediaUrl: varchar('media_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('comment_post_idx').on(table.publicationId)],
);

export const commentsReplies = pgTable('comments_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id')
    .references(() => publicationsComments.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  mediaUrl: varchar('media_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const commentsRelations = relations(
  publicationsComments,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [publicationsComments.publicationId],
      references: [posts.id],
    }),
    author: one(users, {
      fields: [publicationsComments.userId],
      references: [users.id],
    }),
    replies: many(commentsReplies),
    reactions: many(publicationsReactions),
  }),
);

export const repliesRelations = relations(commentsReplies, ({ one }) => ({
  comment: one(publicationsComments, {
    fields: [commentsReplies.commentId],
    references: [publicationsComments.id],
  }),
  author: one(users, {
    fields: [commentsReplies.userId],
    references: [users.id],
  }),
}));

export const publicationsReactions = pgTable(
  'publications_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    reactionableType: reactionableTypeEnum('reactionable_type').notNull(),
    reactionableId: uuid('reactionable_id').notNull(),
    reactionType: reactionTypeEnum().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_like_idx').on(
      table.userId,
      table.reactionableType,
      table.reactionableId,
    ),
    index('likeable_idx').on(table.reactionableType, table.reactionableId),
  ],
);
