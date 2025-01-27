import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { relations } from 'drizzle-orm';
import { likeableTypeEnum } from './enums';

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
  (table) => ({
    postIdx: index('comment_post_idx').on(table.postId),
    parentCommentIdx: index('comment_parent_idx').on(table.parentCommentId),
  }),
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
  likes: many(likes),
}));

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    likeableType: likeableTypeEnum('likeable_type').notNull(),
    likeableId: uuid('likeable_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userLikeIdx: uniqueIndex('user_like_idx').on(
      table.userId,
      table.likeableType,
      table.likeableId,
    ),
    likeableIdx: index('likeable_idx').on(table.likeableType, table.likeableId),
  }),
);
