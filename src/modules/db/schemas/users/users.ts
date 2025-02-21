import { is, relations, sql } from 'drizzle-orm';

import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
  integer,
  boolean,
  check,
} from 'drizzle-orm/pg-core';
import { posts } from '../posts/posts';
import { publicationsComments, usersDoPosts } from '../schema';
import { forumPublications } from '../forums/forums';
import { conversations, messages } from '../chat/chat';

export const userStatus = pgEnum('USER_STATUS', [
  'ACTIVE',
  'DEACTIVATED',
  'BANNED',
]);

export const users = pgTable(
  'Users_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    bio: varchar('bio', { length: 255 }),
    avatar: varchar('profile_picture', { length: 255 }),
    phoneNumber: varchar('phone_number', { length: 255 }),
    googleId: varchar('google_id', { length: 255 }),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetTokenExpires: timestamp('password_reset_token_expires'),
    status: userStatus().default('ACTIVE'),
    isEmailVerified: boolean('is_email_verified').default(false),
    verificationToken: varchar('verification_token', { length: 255 }),
    joinedAt: timestamp('joined_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  publicationsComments: many(publicationsComments),
  forumPublications: many(forumPublications),
  doPost: many(usersDoPosts),
  conversations: many(conversations),
  messages: many(messages),
}));

export * from './friends/friends';
