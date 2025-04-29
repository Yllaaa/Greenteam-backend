import { Injectable } from '@nestjs/common';

import { eq, sql, desc, and, SQL } from 'drizzle-orm';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  groupMembers,
  groups,
  topics,
  users,
} from 'src/modules/db/schemas/schema';
import { GetAllGroupsDtos } from './dtos/get-groups.dto';

@Injectable()
export class GroupsRepository {
  constructor(private drizzle: DrizzleService) {}

  async createGroup(
    data: { dto: CreateGroupDto; bannerUrl: string },
    userId: string,
  ) {
    const { dto, bannerUrl } = data;
    const { name, description, topicId, cityId, countryId } = dto;
    return await this.drizzle.db
      .insert(groups)
      .values({
        name,
        description,
        topicId,
        ownerId: userId,
        banner: bannerUrl,
        cityId,
        countryId,
      })
      .returning();
  }

  async getAllGroups(query: GetAllGroupsDtos, userId?: string) {
    const { topicId, limit, page, countryId, cityId } = query;
    const offset = Math.max(0, ((page ?? 1) - 1) * (limit ?? 10));
    const selectObj: any = {
      id: groups.id,
      name: groups.name,
      description: groups.description,
      banner: groups.banner,
      ownerId: groups.ownerId,
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

    let whereConditions: SQL<unknown> | undefined;

    if (topicId) {
      whereConditions = eq(groups.topicId, topicId);
    }

    if (countryId) {
      const countryCondition = eq(groups.countryId, countryId);
      whereConditions = whereConditions
        ? and(whereConditions, countryCondition)
        : countryCondition;
    }

    if (countryId && cityId) {
      const cityCondition = eq(groups.cityId, cityId);
      whereConditions = whereConditions
        ? and(whereConditions, cityCondition)
        : cityCondition;
    }

    const groupsWithMetadata = await this.drizzle.db
      .select(selectObj)
      .from(groups)
      .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .leftJoin(topics, eq(topics.id, groups.topicId))
      .where(whereConditions)
      .groupBy(groups.id, topics.id, topics.name)
      .limit(limit ?? 10)

      .offset(offset);
    return groupsWithMetadata;
  }
  async getGroupByName(name: string) {
    return await this.drizzle.db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.name, name),
    });
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

  async deleteGroup(groupId: string, userId: string) {
    return await this.drizzle.db
      .delete(groups)
      .where(and(eq(groups.id, groupId), eq(groups.ownerId, userId)))
      .returning();
  }
}
