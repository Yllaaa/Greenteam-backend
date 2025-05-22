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
  index,
} from 'drizzle-orm/pg-core';
import { posts } from '../posts/posts';
import {
  cities,
  countries,
  followers,
  groupMembers,
  publicationsComments,
  publicationsReactions,
  usersDoPosts,
} from '../schema';
import { forumPublications } from '../forums/forums';
import { conversations, messages } from '../chat/chat';

export const userStatus = pgEnum('USER_STATUS', [
  'ACTIVE',
  'DEACTIVATED',
  'BANNED',
]);

export const accountType = pgEnum('account_type', ['normal', 'sponsor']);

export const languageEnum = pgEnum('language_preference', ['en', 'es']);

export const users = pgTable(
  'Users_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    bio: varchar('bio', { length: 255 }),
    avatar: varchar('avatar', { length: 255 }),
    cover: varchar('cover', { length: 255 }),
    phoneNumber: varchar('phone_number', { length: 255 }),
    googleId: varchar('google_id', { length: 255 }),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetTokenExpires: timestamp('password_reset_token_expires'),
    status: userStatus().default('ACTIVE'),
    isEmailVerified: boolean('is_email_verified').default(false),
    verificationToken: varchar('verification_token', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    languagePreference: languageEnum('language_preference').default('en'),
    fcmToken: varchar('fcm_token', { length: 255 }),
    isVerified: boolean('is_verified').default(false),
    accountType: accountType('account_type').default('normal'),

    joinedAt: timestamp('joined_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
  ],
);

export const usersLocations = pgTable(
  'users_locations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id, { onDelete: 'restrict' }),
    cityId: integer('city_id').references(() => cities.id, {
      onDelete: 'restrict',
    }),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('users_locations_country_id_idx').on(table.countryId),
    index('users_locations_city_id_idx').on(table.cityId),
  ],
);

export const usersLocationsRelations = relations(usersLocations, ({ one }) => ({
  user: one(users, {
    fields: [usersLocations.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [usersLocations.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [usersLocations.cityId],
    references: [cities.id],
  }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  location: one(usersLocations, {
    fields: [users.id],
    references: [usersLocations.userId],
  }),
  posts: many(posts),
  publicationsComments: many(publicationsComments),
  forumPublications: many(forumPublications),
  publicationsReactions: many(publicationsReactions),
  doPost: many(usersDoPosts),
  groupMembers: many(groupMembers),
  conversations: many(conversations),
  followers: many(followers, { relationName: 'followers' }),
  following: many(followers, { relationName: 'following' }),
  messages: many(messages),
}));

export * from './followers';
