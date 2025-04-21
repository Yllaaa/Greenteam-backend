import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const friendRequestStatus = pgEnum('friend_request_status', [
  'pending',
  'accepted',
  'declined',
]);

export const friendRequests = pgTable('friend_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id),
  receiverId: uuid('receiver_id')
    .notNull()
    .references(() => users.id),
  status: friendRequestStatus().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const friends = pgTable('friends', {
  id: uuid('id').primaryKey().defaultRandom(),
  userOneId: uuid('user_one_id')
    .notNull()
    .references(() => users.id),
  userTwoId: uuid('user_two_id')
    .notNull()
    .references(() => users.id),
  since: timestamp('since').defaultNow().notNull(),
});

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  sender: one(users, {
    fields: [friendRequests.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [friendRequests.receiverId],
    references: [users.id],
  }),
}));

export const mutualFriendsRelations = relations(friends, ({ one }) => ({
  userOne: one(users, {
    fields: [friends.userOneId],
    references: [users.id],
  }),
  userTwo: one(users, {
    fields: [friends.userTwoId],
    references: [users.id],
  }),
}));
