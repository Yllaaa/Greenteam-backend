import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
@Injectable()
export class CommonRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getTopics() {
    return await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
      with: {
        parent: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getMainTopics() {
    return await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
      where: (topics, { isNull }) => isNull(topics.parentId),
    });
  }
}
