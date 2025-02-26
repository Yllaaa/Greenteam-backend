import { pgTable, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users";
import { relations } from "drizzle-orm";

export const followees = pgTable('followees', {
    userId: uuid('user_id').notNull().references(() => users.id),
    followeeId: uuid('followee_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    primaryKey({ columns: [table.userId, table.followeeId] })
])

export const followeesRelations = relations(followees, ({ one }) => ({
    user: one(users, {
        fields: [followees.userId],
        references: [users.id],
    }),
    followee: one(users, {
        fields: [followees.followeeId],
        references: [users.id],
    }),
}))