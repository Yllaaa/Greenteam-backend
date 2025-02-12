import {
  pgTable,
  uuid,
  text,
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
    parentCommentId: uuid('parent_comment_id').references(
      () => publicationsComments.id,
      { onDelete: 'cascade' },
    ),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('comment_post_idx').on(table.publicationId),
    index('comment_parent_idx').on(table.parentCommentId),
  ],
);

export const commentsRelations = relations(
  publicationsComments,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [publicationsComments.publicationId],
      references: [posts.id],
    }),
    parentComment: one(publicationsComments, {
      fields: [publicationsComments.parentCommentId],
      references: [publicationsComments.id],
    }),
    replies: many(publicationsComments),
    likes: many(publicationsReactions),
  }),
);

export const publicationsReactions = pgTable(
  'publications_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    reactionableType: reactionableTypeEnum('likeable_type').notNull(),
    reactionableId: uuid('likeable_id').notNull(),
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
