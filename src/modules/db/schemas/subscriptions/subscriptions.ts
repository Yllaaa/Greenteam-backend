import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';

export const subscriptionTiers = pgTable('subscription_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  benefits: jsonb('benefits').notNull(),
});

export const usersSubscriptions = pgTable('users_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  tierId: uuid('tierId')
    .notNull()
    .references(() => subscriptionTiers.id),
  status: text('status').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
});

export const subscriptionsPayments = pgTable('subscriptions_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscriptionId')
    .notNull()
    .references(() => usersSubscriptions.id),
  stripePaymentId: text('stripe_payment_id').notNull(),
  status: text('status').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptionsInvoice = pgTable('subscriptions_invoice', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentId: uuid('payment_id')
    .notNull()
    .references(() => subscriptionsPayments.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  stripeInvoiceId: text('stripe_invoice_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersSubscriptionsRelations = relations(
  usersSubscriptions,
  ({ one }) => ({
    tier: one(subscriptionTiers, {
      fields: [usersSubscriptions.tierId],
      references: [subscriptionTiers.id],
    }),
  }),
);

export const subscriptionsPaymentsRelations = relations(
  subscriptionsPayments,
  ({ one }) => ({
    subscription: one(usersSubscriptions, {
      fields: [subscriptionsPayments.subscriptionId],
      references: [usersSubscriptions.id],
    }),
  }),
);

export const subscriptionsInvoiceRelations = relations(
  subscriptionsInvoice,
  ({ one }) => ({
    payment: one(subscriptionsPayments, {
      fields: [subscriptionsInvoice.paymentId],
      references: [subscriptionsPayments.id],
    }),
    user: one(users, {
      fields: [subscriptionsInvoice.userId],
      references: [users.id],
    }),
  }),
);
