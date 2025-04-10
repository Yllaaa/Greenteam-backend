import { Injectable } from '@nestjs/common';

import { eq, sql, desc } from 'drizzle-orm';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  groupMembers,
  groups,
  topics,
  users,
} from 'src/modules/db/schemas/schema';

@Injectable()
export class GroupsRepository {
  constructor(private drizzle: DrizzleService) {}

  async createGroup(
    data: { dto: CreateGroupDto; bannerUrl: string },
    userId: string,
  ) {
    const { dto, bannerUrl } = data;
    const { name, description, topicId } = dto;
    return await this.drizzle.db
      .insert(groups)
      .values({
        name: name,
        description: description,
        topicId: topicId,
        ownerId: userId,
        banner: bannerUrl,
      })
      .returning();
  }

  async getAllGroups(
    pagination: { limit: number; page: number },
    userId?: string,
    topicId?: number,
  ) {
    const limit = pagination?.limit || 10;
    const offset = Math.max(0, (pagination.page - 1) * limit);

    const selectObj: any = {
      id: groups.id,
      name: groups.name,
      description: groups.description,
      banner: groups.banner,
      topic: {
        topicId: topics.id,
        topicName: topics.name,
      },
      memberCount:
        sql`cast(count(distinct ${groupMembers.userId}) as integer)`.as(
          'member_count',
        ),
    };

    if (userId) {
      selectObj.isUserMember = sql`
        case when exists (
          select 1 from ${groupMembers}
          where ${groupMembers.groupId} = ${groups.id}
          and ${groupMembers.userId} = ${userId}
        ) then true else false end
      `.as('is_user_member');
    }

    const groupsWithMetadata = await this.drizzle.db
      .select(selectObj)
      .from(groups)
      .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .leftJoin(topics, eq(topics.id, groups.topicId))
      .where(topicId ? eq(groups.topicId, topicId) : undefined)
      .groupBy(groups.id, topics.id, topics.name)
      .limit(limit)
      .offset(offset);

    return groupsWithMetadata;
  }
  async getGroupById(groupId: string) {
    return await this.drizzle.db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);
  }

  async getGroupDetails(groupId: string, userId?: string) {
    const selectObj: any = {
      id: groups.id,
      name: groups.name,
      description: groups.description,
      banner: groups.banner,
      topic: {
        topicId: topics.id,
        topicName: topics.name,
      },
      ownerId: groups.ownerId,
      ownerName: users.fullName,
      memberCount:
        sql`cast(count(distinct ${groupMembers.userId}) as integer)`.as(
          'member_count',
        ),
    };

    if (userId) {
      selectObj.isUserMember = sql`
        case when exists (
          select 1 from ${groupMembers}
          where ${groupMembers.groupId} = ${groups.id}
          and ${groupMembers.userId} = ${userId}
        ) then true else false end
      `.as('is_user_member');
    }

    const groupDetails = await this.drizzle.db
      .select(selectObj)
      .from(groups)
      .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .leftJoin(topics, eq(topics.id, groups.topicId))
      .leftJoin(users, eq(users.id, groups.ownerId))
      .where(eq(groups.id, groupId))
      .groupBy(groups.id, topics.id, topics.name, users.id, users.fullName)
      .limit(1);

    if (!groupDetails.length) {
      return null;
    }

    const recentMembers = await this.drizzle.db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatar: users.avatar,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(desc(groupMembers.joinedAt))
      .limit(3);

    return {
      ...groupDetails[0],
      recentMembers,
      isAdmin: groupDetails[0].ownerId === userId,
    };
  }

  async updateGroup(
    groupId: string,
    data: {
      name?: string;
      description?: string;
      bannerUrl?: string;
    },
  ) {
    return await this.drizzle.db
      .update(groups)
      .set({
        name: data.name,
        description: data.description,
        banner: data.bannerUrl,
      })
      .where(eq(groups.id, groupId))
      .returning();
  }

  async deleteGroup(groupId: string) {
    return await this.drizzle.db
      .delete(groups)
      .where(eq(groups.id, groupId))
      .returning();
  }
}
