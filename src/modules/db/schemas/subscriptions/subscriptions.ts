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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';

export const subscriptionTiers = pgTable(
  'subscription_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    price: integer('price').notNull(),
    stripeProductId: text('stripe_product_id'),
    stripePriceId: text('stripe_price_id'),
  },
  (table) => [index('subscription_tiers_name_idx').on(table.name)],
);

export const subscriptionBenefits = pgTable('subscription_benefits', {
  id: uuid('id').primaryKey().defaultRandom(),
  benefit: text('benefit').notNull(),
});

export const subscriptionTierBenefits = pgTable(
  'subscription_tier_benefits',
  {
    tierId: uuid('tier_id')
      .notNull()
      .references(() => subscriptionTiers.id, { onDelete: 'cascade' }),
    benefitId: uuid('benefit_id')
      .notNull()
      .references(() => subscriptionBenefits.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('subscription_tier_benefits_tier_id_idx').on(table.tierId),
    index('subscription_tier_benefits_benefit_id_idx').on(table.benefitId),
  ],
);

export const usersSubscriptions = pgTable(
  'users_subscriptions',
  {
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
  },
  (table) => [
    index('users_subscriptions_user_id_idx').on(table.userId),
    index('users_subscriptions_tier_id_idx').on(table.tierId),
    index('users_subscriptions_status_idx').on(table.status),
    index('users_subscriptions_stripe_id_idx').on(table.stripeSubscriptionId),
  ],
);

export const usersSubscriptionsRelations = relations(
  usersSubscriptions,
  ({ one }) => ({
    tier: one(subscriptionTiers, {
      fields: [usersSubscriptions.tierId],
      references: [subscriptionTiers.id],
    }),
  }),
);

export const subscriptionTiersRelations = relations(
  subscriptionTiers,
  ({ many }) => ({
    TierBenefits: many(subscriptionTierBenefits),
  }),
);

export const subscriptionTierBenefitsRelations = relations(
  subscriptionTierBenefits,
  ({ one }) => ({
    benefit: one(subscriptionBenefits, {
      fields: [subscriptionTierBenefits.benefitId],
      references: [subscriptionBenefits.id],
    }),
    tier: one(subscriptionTiers, {
      fields: [subscriptionTierBenefits.tierId],
      references: [subscriptionTiers.id],
    }),
  }),
);
