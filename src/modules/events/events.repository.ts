import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { events, usersJoinedEvent } from '../db/schemas/schema';
import { and, asc, eq, isNull, sql, SQL } from 'drizzle-orm';
import { EventsDto } from './dto/events.dto';

@Injectable()
export class EventsRepository {
  constructor(readonly drizzleService: DrizzleService) { }

  async createEvent(event: EventsDto) {
    const eventValues = {
      creatorId: event.creatorId,
      creatorType: event.creatorType,
      title: event.title,
      description: event.description,
      location: event.location,
      category: event.category,
      topicId: event.topicId,
      priority: 0,
      startDate: event.startDate,
      endDate: event.endDate,
    };

    if (event.groupId) {
      Object.assign(eventValues, { groupId: event.groupId });
    }

    const newEvent = await this.drizzleService.db
      .insert(events)
      .values(eventValues)
      .returning();
    return newEvent[0];
  }

  async getEvents(
    category?: SQL<'social' | 'volunteering&work' | 'talks&workshops'>,
    page: number = 0,
    limit: number = 10,
  ) {
    const offset = Math.max(0, (page - 1) * limit);
    return await this.drizzleService.db.query.events.findMany({
      offset: offset,
      limit: limit,
      where: category 
        ? and(eq(events.category, category), isNull(events.groupId)) 
        : isNull(events.groupId),
      orderBy: [asc(events.priority), asc(events.startDate)],
    });
  }

  async getEventDetails(id: string) {
    return await this.drizzleService.db.query.events.findFirst({
      where: eq(events.id, id),
      extras: {
        joinedCount: sql<number>`(
          SELECT COUNT(*)::integer 
          FROM public.users_joined_event 
          WHERE users_joined_event.event_id = ${id}
        )`.as('joined_count'),
      },
      with: {
        topic: true,
        userCreator: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        group: true,
      },
    });
  }

  async getEvent(id: string) {
    return await this.drizzleService.db.query.events.findFirst({
      where: eq(events.id, id),
    });
  }

  async addUserJoinedEvent(eventId: string, userId: string) {
    return await this.drizzleService.db.insert(usersJoinedEvent).values({
      userId: userId,
      eventId: eventId,
    });
  }

  async checkUserJoinedEvent(
    eventId: string,
    userId: string,
  ): Promise<boolean> {
    const userJoined =
      await this.drizzleService.db.query.usersJoinedEvent.findFirst({
        where: and(
          eq(usersJoinedEvent.eventId, eventId),
          eq(usersJoinedEvent.userId, userId),
        ),
      });

    return !!userJoined;
  }
}
