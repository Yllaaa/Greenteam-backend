import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { EventMode, events } from 'src/modules/db/schemas/schema';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { EventResponse } from 'src/modules/events/events/interfaces/events.interface';
import { DrizzleService } from 'src/modules/db/drizzle.service';

@Injectable()
export class PagesEventsRepository {
  constructor(private drizzleService: DrizzleService) {}

  async getEvents(
    dto: GetEventsDto,
    pageId: string,
    userId?: string,
  ): Promise<EventResponse[]> {
    const { page, limit, category, eventMode } = dto;
    const offset = Math.max(0, (page - 1) * limit);
    const returnedEvents = await this.drizzleService.db.query.events.findMany({
      columns: {
        id: true,
        title: true,
        description: true,
        location: true,
        mode: true,
        startDate: true,
        endDate: true,
        category: true,
        posterUrl: true,
        hostedBy: true,
      },
      offset: offset,
      limit: limit,
      orderBy: (events, { asc }) => [asc(events.priority), desc(events.id)],
      where: (events, { and, eq, isNull }) =>
        and(
          category ? eq(events.category, dto.category) : undefined,
          eq(events.creatorId, pageId),
          eventMode ? eq(events.mode, dto.eventMode as EventMode) : undefined,
        ),
      extras: userId
        ? {
            isJoined: sql<boolean>`(
              SELECT EXISTS(
                SELECT 1 
                FROM public.users_joined_event 
                WHERE users_joined_event.event_id = ${events.id} 
                AND users_joined_event.user_id = ${userId}
              )
            )`.as('is_joined'),
          }
        : {},
      with: {
        pageCreator: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
    return returnedEvents as unknown as EventResponse[];
  }

  async deleteEvent(id: string, userId: string) {
    return await this.drizzleService.db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.creatorId, userId)));
  }
}
