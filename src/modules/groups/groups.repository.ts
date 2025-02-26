import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { groups } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';
import { InsertGroupDto, UpdateGroupDto } from './dtos/groups.dto';

@Injectable()
export class GroupsRepository {
  constructor(private drizzle: DrizzleService) { }

  async createGroup(data: InsertGroupDto) {
    return await this.drizzle.db.insert(groups).values(data).returning();
  }

  async getAllGroups(pagination: { limit: number; page: number }) {
    const limit = pagination?.limit || 10;
    const offset = Math.max(0, (pagination.page - 1) * limit);
    const groupsList = await this.drizzle.db
      .select()
      .from(groups)
      .limit(limit)
      .offset(offset);
    return groupsList;
  }


  async getGroupById(groupId: string) {
    return await this.drizzle.db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  }

  async updateGroup(groupId: string, data: UpdateGroupDto) {
    return await this.drizzle.db
      .update(groups)
      .set(data)
      .where(eq(groups.id, groupId))
      .returning();
  }

  async deleteGroup(groupId: string) {
    return await this.drizzle.db.delete(groups).where(eq(groups.id, groupId)).returning();
  }
}
