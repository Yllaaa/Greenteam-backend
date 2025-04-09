import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import {
  events,
  publicationsComments,
  usersJoinedEvent,
} from '../../db/schemas/schema';
import { and, asc, desc, eq, isNull, sql, SQL } from 'drizzle-orm';
import { CreateEventDto } from '../events/dto/events.dto';
import { EventResponse } from './interfaces/events.interface';
import { GetEventsDto } from './dto/getEvents.dto';

@Injectable()
export class EventsRepository {
  constructor(readonly drizzleService: DrizzleService) {}

  async createEvent(
    event: { dto: CreateEventDto; posterUrl: string },
    creatorId: string,
  ) {
    const { dto, posterUrl } = event;
    const {
      title,
      description,
      location,
      category,
      groupId,
      creatorType,
      startDate,
      endDate,
    } = dto;
    const eventValues = {
      creatorId,
      creatorType: creatorType,
      title: title,
      description: description,
      location: location,
      category: category,
      hostedBy: 'user' as any,
      priority: 1,
      startDate: startDate,
      endDate: endDate,
      posterUrl: posterUrl,
    };

    if (groupId) {
      Object.assign(eventValues, { groupId: groupId });
    }

    const newEvent = await this.drizzleService.db
      .insert(events)
      .values(eventValues)
      .returning();
    return newEvent[0];
  }

  async getEvents(
    dto: GetEventsDto,
    userId?: string,
    pageId?: string,
  ): Promise<EventResponse[]> {
    const { page, limit } = dto;
    const offset = Math.max(0, (page - 1) * limit);
    const returnedEvents = await this.drizzleService.db.query.events.findMany({
      columns: {
        id: true,
        title: true,
        description: true,
        location: true,

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
          isNull(events.groupId),
          dto.category ? eq(events.category, dto.category) : undefined,
          pageId
            ? and(eq(events.creatorId, pageId), eq(events.creatorType, 'page'))
            : undefined,
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
      with: pageId
        ? {
            pageCreator: {
              columns: {
                id: true,
                name: true,
              },
            },
          }
        : {
            userCreator: {
              columns: {
                id: true,
                fullName: true,
              },
            },
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

  async getEventDetails(id: string, userId: string, groupId?: string) {
    const event = await this.drizzleService.db.query.events.findFirst({
      columns: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        category: true,
        posterUrl: true,
        hostedBy: true,
      },
      where: (events, { eq, and }) => {
        const conditions = [eq(events.id, id)];
        if (groupId) {
          conditions.push(eq(events.groupId, groupId));
        }
        return and(...conditions);
      },
      extras: {
        joinedCount: sql<number>`(
          SELECT COUNT(*)::integer 
          FROM public.users_joined_event 
          WHERE users_joined_event.event_id = ${id}
        )`.as('joined_count'),
        ...(userId && {
          isJoined: sql<boolean>`(
            SELECT EXISTS(
              SELECT 1 
              FROM public.users_joined_event 
              WHERE users_joined_event.event_id = ${id} 
              AND users_joined_event.user_id = ${userId}
            )
          )`.as('is_joined'),
        }),
        commentsCount: sql<number>`(
          SELECT COUNT(DISTINCT pc.id)::integer
          FROM publications_comments pc
          WHERE pc.publication_id = ${events.id}
          AND pc.publication_type = 'event'
        )`.as('comments_count'),
      },
      with: {
        userCreator: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        pageCreator: {
          columns: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        ...(groupId && {
          group: {
            columns: {
              id: true,
              name: true,
            },
          },
        }),
      },
    });

    if (!event) return null;

    const creator = event.userCreator
      ? {
          id: Array.isArray(event.userCreator)
            ? event.userCreator[0]?.id
            : event.userCreator?.id,
          fullName: Array.isArray(event.userCreator)
            ? event.userCreator[0]?.fullName
            : event.userCreator?.fullName,
          username: Array.isArray(event.userCreator)
            ? event.userCreator[0]?.username
            : event.userCreator?.username,
          avatar: Array.isArray(event.userCreator)
            ? event.userCreator[0]?.avatar
            : event.userCreator?.avatar,
        }
      : event.pageCreator
        ? {
            id: Array.isArray(event.pageCreator)
              ? event.pageCreator[0]?.id
              : event.pageCreator?.id,
            fullName: Array.isArray(event.pageCreator)
              ? event.pageCreator[0]?.name
              : event.pageCreator?.name,
            username: Array.isArray(event.pageCreator)
              ? event.pageCreator[0]?.slug
              : event.pageCreator?.slug,
            avatar: Array.isArray(event.pageCreator)
              ? event.pageCreator[0]?.avatar
              : event.pageCreator?.avatar,
          }
        : null;

    const { userCreator, pageCreator, group, ...rest } = event;

    return {
      ...rest,
      ...(group && { group }),
      creator,
    };
  }

  async getEventById(id: string) {
    return await this.drizzleService.db.query.events.findFirst({
      where: eq(events.id, id),
    });
  }

  async getEventHost(eventId: string): Promise<EventHost> {
    const event = await this.drizzleService.db.query.events.findFirst({
      where: eq(events.id, eventId),
      columns: {
        hostedBy: true,
      },
      with: {
        userCreator: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        pageCreator: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return event as unknown as EventHost;
  }

  async addUserJoinedEvent(eventId: string, userId: string) {
    return await this.drizzleService.db.insert(usersJoinedEvent).values({
      userId: userId,
      eventId: eventId,
    });
  }

  async removeUserJoinedEvent(eventId: string, userId: string) {
    return await this.drizzleService.db
      .delete(usersJoinedEvent)
      .where(
        and(
          eq(usersJoinedEvent.eventId, eventId),
          eq(usersJoinedEvent.userId, userId),
        ),
      );
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
