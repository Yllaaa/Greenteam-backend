import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  numeric,
  char,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { topics } from '../schema';

export const sellerTypeEnum = pgEnum('seller_type', ['user', 'page']);
export const marketTypeEnum = pgEnum('market_type', [
  'local_business',
  'value_driven_business',
  'second_hand',
]);

export const products = pgTable(
  'product',
  {
    id: serial('id').primaryKey(),
    sellerId: integer('seller_id').notNull(),
    sellerType: sellerTypeEnum('seller_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: numeric('price', { precision: 10, scale: 2 }),
    isHidden: boolean('is_hidden').default(false),
    marketType: marketTypeEnum('market_type'),
    topicId: integer('topic_id').references(() => topics.id),
    countryIso: char('country_iso', { length: 2 }),
    district: varchar('district', { length: 100 }),
  },
  (t) => [
    index('seller_id_idx').on(t.sellerId),
    index('topic_id_idx').on(t.topicId),
    index('location_idx').on(t.countryIso, t.district),
    index('market_type_idx').on(t.marketType, t.isHidden),
    index('price_idx').on(t.price),
  ],
);
