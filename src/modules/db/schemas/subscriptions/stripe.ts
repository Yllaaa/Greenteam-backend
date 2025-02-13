import { pgTable, uuid, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "../schema";
import { relations } from "drizzle-orm";
import { subscriptions } from "./subscriptions";

export enum StripePaymentStatus {
    Pending = 'Pending',
    Paid = 'Paid',
    Failed = 'Failed'
}

export const stripePaymentsStatus = pgEnum('stripe_payments_status', ['Pending', 'Paid', 'Failed'])

export const stripePayments = pgTable('stripe_payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    subscriptionId: varchar('subscription_id').notNull(),
    price: integer('price').notNull(),
    paymentIntentId: varchar('payment_intent_id').notNull(),
    status: stripePaymentsStatus('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const stripePaymentsRelations = relations(stripePayments, ({ one }) => ({
    user: one(users, {
        fields: [stripePayments.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [stripePayments.subscriptionId],
        references: [subscriptions.id],
    })
}))