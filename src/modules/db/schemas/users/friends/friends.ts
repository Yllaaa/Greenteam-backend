import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../users";
import { relations } from 'drizzle-orm';

export const friendRequestStatus = pgEnum('friend_request_status', ['pending', 'accepted', 'declined']);

export const friendRequests = pgTable('friend_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').notNull().references(() => users.id),
    receiverId: uuid('receiver_id').notNull().references(() => users.id),
    status: friendRequestStatus().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const friends = pgTable('friends', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    friendId: uuid('friend_id').notNull().references(() => users.id)
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

export const friendsRelations = relations(friends, ({ one }) => ({
    user: one(users, {
        fields: [friends.userId],
        references: [users.id],
    }),
    friend: one(users, {
        fields: [friends.friendId],
        references: [users.id],
    }),
}));

