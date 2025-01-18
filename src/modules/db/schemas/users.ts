import { relations, sql } from 'drizzle-orm';

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

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    bio: varchar('bio', { length: 255 }),
    avatar: varchar('profile_picture', { length: 255 }).default(
      'https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png',
    ),
    phoneNumber: varchar('phone_number', { length: 255 }).notNull(),
    googleId: varchar('google_id', { length: 255 }),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetTokenExpires: timestamp('password_reset_token_expires'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('user_email_idx').on(table.email),
      usernameIdx: uniqueIndex('user_username_idx').on(table.username),
    };
  },
);
