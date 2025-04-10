import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { events, usersJoinedEvent } from '../../db/schemas/schema';
import { and, asc, eq, sql, SQL } from 'drizzle-orm';

@Injectable()
export class EventsGroupRepository {
  constructor(readonly drizzleService: DrizzleService) {}

  async getGroupEvents(
    groupId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const offset = Math.max(0, (page - 1) * limit);

    return await this.drizzleService.db.query.events.findMany({
      columns: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        category: true,
        posterUrl: true,
      },
      offset: offset,
      limit: limit,
      where: eq(events.groupId, groupId),
      orderBy: [asc(events.priority), asc(events.startDate)],
      with: {
        group: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
