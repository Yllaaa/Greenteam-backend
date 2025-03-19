import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { events, usersJoinedEvent } from '../../db/schemas/schema';
import { and, asc, eq, sql, SQL } from 'drizzle-orm';
import { EventsDto } from '../../events/events/dto/events.dto';

@Injectable()
export class EventsGroupRepository {
  constructor(readonly drizzleService: DrizzleService) {}

  async getGroupEvents(
    groupId: string,
    category?: 'social' | 'volunteering&work' | 'talks&workshops',
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = Math.max(0, (page - 1) * limit);

    const conditions = [eq(events.groupId, groupId)];

    if (category) {
      conditions.push(eq(events.category, category));
    }

    return await this.drizzleService.db.query.events.findMany({
      offset: offset,
      limit: limit,
      where: and(...conditions),
      orderBy: [asc(events.priority), asc(events.startDate)],
      with: {
        userCreator: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }
}
