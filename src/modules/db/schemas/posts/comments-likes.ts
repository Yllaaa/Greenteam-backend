import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { relations } from 'drizzle-orm';
import { reactionableTypeEnum, reactionTypeEnum } from './enums';
import { users } from '../schema';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .references(() => posts.id)
      .notNull(),
    parentCommentId: uuid('parent_comment_id').references(() => comments.id),
    userId: uuid('user_id').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('comment_post_idx').on(table.postId),
    index('comment_parent_idx').on(table.parentCommentId),
  ],
);

export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  replies: many(comments),
  likes: many(publicationsReactions),
}));

export const publicationsReactions = pgTable(
  'publications_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
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
    index('likeable_idx').on(
      table.reactionableType,
      table.reactionableId,
    ),
  ],
);
