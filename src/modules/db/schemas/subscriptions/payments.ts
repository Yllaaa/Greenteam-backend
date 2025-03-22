import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, usersSubscriptions } from '../schema';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export const subscriptionsPayments = pgTable(
  'subscriptions_payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscriptionId')
      .notNull()
      .references(() => usersSubscriptions.id),
    stripePaymentId: text('stripe_payment_id').notNull(),
    status: paymentStatusEnum('status').notNull(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('subscriptions_payments_subscription_id_idx').on(
      table.subscriptionId,
    ),
    index('subscriptions_payments_stripe_id_idx').on(table.stripePaymentId),
    index('subscriptions_payments_status_idx').on(table.status),
  ],
);

export const subscriptionsInvoice = pgTable(
  'subscriptions_invoice',
  {
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
  },
  (table) => [
    index('subscriptions_invoice_payment_id_idx').on(table.paymentId),
    index('subscriptions_invoice_user_id_idx').on(table.userId),
  ],
);

export const stripeEventLogs = pgTable('stripe_event_logs', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull(),
  eventType: text('event_type').notNull(),
  objectId: text('object_id'),
  objectType: text('object_type'),
  status: text('status'),
  rawData: jsonb('raw_data'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

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
