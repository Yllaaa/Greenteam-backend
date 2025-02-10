import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { events, events_joined } from "../db/schemas/schema";
import { asc, eq } from "drizzle-orm";

@Injectable()
export class EventsRepository {
    constructor(
        readonly drizzleService: DrizzleService
    ) { }

    async createEvent(event: any) {
        return await this.drizzleService.db.insert(events).values(event).returning()
    }

    async getEvents(offset: number, limit: number) {
        return await this.drizzleService.db.query.events.findMany({
            offset: offset,
            limit: limit,
            orderBy: [asc(events.priority), asc(events.start_date)]
        })
    }

    async getEventsByCategory(offset: number, limit: number, category: any) {
        return await this.drizzleService.db.query.events.findMany({
            offset: offset,
            limit: limit,
            where: eq(events.category, category),
            orderBy: [asc(events.priority), asc(events.start_date)]
        })
    }

    async getEventDetails(id: string) {
        return await this.drizzleService.db.query.events.findFirst({
            where: eq(events.id, id),
            with: {
                topic: true,
                events_joined: {
                    columns: {},
                    with: {
                        user: {
                            columns: {
                                fullName: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        })
    }

    async getEvent(id: string) {
        return await this.drizzleService.db.query.events.findFirst({
            where: eq(events.id, id)
        })
    }

    async addEventJoin(event_id: string, user_id: string) {
        return await this.drizzleService.db.insert(events_joined).values({
            user_id: user_id,
            event_id: event_id
        })
    }
}