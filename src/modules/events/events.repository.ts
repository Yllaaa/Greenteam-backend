import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { events } from "../db/schemas/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class EventsRepository {
    constructor(
        readonly drizzleService: DrizzleService
    ) { }

    async createEvent(event: any) {
        await this.drizzleService.db.insert(events).values(event)
    }

    async getEvents(offset: number, limit: number) {
        return await this.drizzleService.db.query.events.findMany({
            offset: offset,
            limit: limit
        })
    }

    async getEventsByCategory(offset: number, limit: number, category: any) {
        return await this.drizzleService.db.query.events.findMany({
            offset: offset,
            limit: limit,
            where: eq(events.category, category),
        })
    }

    async getEventDetails(id: string) {
        return await this.drizzleService.db.query.events.findFirst({
            where: eq(events.id, id)
        })
    }

}