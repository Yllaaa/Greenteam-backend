import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { groups } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';
import { InsertGroupDto, UpdateGroupDto } from './dtos/groups.dto';

@Injectable()
export class GroupsRepository {
  constructor(private drizzle: DrizzleService) { }

  async createGroup(data: InsertGroupDto) {
    // TODO: should check for topic exist and user exist 

    // const owner = await this.UsersRepository.findById(data.ownerId);
    // if (!owner) {
    //   throw new NotFoundException(`User with ID ${data.ownerId} not found`);
    // }

    // const topic = await this.topicsRepository.findById(data.topicId);
    // if (!topic) {
    //   throw new NotFoundException(`Topic with ID ${data.topicId} not found`);
    // }
    return await this.drizzle.db.insert(groups).values(data).returning();
  }

  async getAllGroups(pagination?: { limit: number; page: number }) {
    const groupsList = await this.drizzle.db
      .select()
      .from(groups)
      .limit(pagination?.limit || 10)
      .offset(
        (pagination?.page ? pagination.page - 1 : 0) *
        (pagination?.limit || 10),
      );

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
