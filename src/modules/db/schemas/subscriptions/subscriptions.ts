import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../schema";
import { relations } from "drizzle-orm";

export enum SubscriptionType {
    Volunteer = 'Volunteer',
    Business = 'Business',
    Company = 'Company'
}

export enum SubscriptionState {
    NeedAproval = 'NeedAproval',
    Pending = 'Pending',
    Active = 'Active',
    Expired = 'Expired',
    Canceled = 'Canceled'
}

export const subscriptionTypes = pgEnum('subscriptions_types', ['Volunteer', 'Business', 'Company'])

export const subscriptionStates = pgEnum('subscriptions_states', ['NeedAproval','Pending','Active', 'Expired', 'Canceled'])

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    type: subscriptionTypes().notNull(),
    endDate: timestamp('end_date'),
    state: subscriptionStates().notNull(),
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
}))