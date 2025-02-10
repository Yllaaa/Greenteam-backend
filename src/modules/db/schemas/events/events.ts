import { pgEnum, pgTable, varchar, date, uuid, text, smallint, primaryKey } from 'drizzle-orm/pg-core';
import { topics, users } from '../schema';
import { relations } from 'drizzle-orm';

export const EventCreatorType = pgEnum('EventCreatorType', ['User', 'Page'])

export const EventCategory = pgEnum('Event Category', ['Social Events', 'Volunteering', 'Jobs', 'Talks / Workshops'])

export const events = pgTable('events', {
    id: uuid().primaryKey().defaultRandom(),
    creator_id: uuid().notNull(),
    creator_type: EventCreatorType().notNull(),
    name: varchar().notNull(),
    description: text().notNull(),
    location: varchar().notNull(),
    start_date: date().notNull(),
    end_date: date().notNull(),
    category: EventCategory().notNull(),
    poster: varchar().notNull(),
    priority: smallint().notNull().default(0),
    topic_id: uuid().notNull().references(() => topics.id)
});

export const events_relations = relations(events, ({ one, many }) => ({
    events_joined: many(events_joined),
    topic: one(topics, {
        fields: [events.topic_id],
        references: [topics.id]
    })
}))

export const events_joined = pgTable('events_joined', {
    user_id: uuid().notNull().references(() => users.id),
    event_id: uuid().notNull().references(() => events.id)
}, (table) => [
    primaryKey({columns: [table.event_id, table.user_id]})
])

export const events_joined_relations = relations(events_joined, ({ one }) => ({
    user: one(users, {
        fields: [events_joined.user_id],
        references: [users.id]
    }),
    event: one(events, {
        fields: [events_joined.event_id],
        references: [events.id]
    })
}))
