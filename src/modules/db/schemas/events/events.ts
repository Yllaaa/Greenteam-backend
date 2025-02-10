import { pgEnum, pgTable, varchar, date, uuid, text } from 'drizzle-orm/pg-core';

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
    poster: varchar().notNull()
});