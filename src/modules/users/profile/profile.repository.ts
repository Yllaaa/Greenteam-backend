import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { groupMembers, groups, pages, pagesFollowers, users } from '../../db/schemas/schema';
import { eq, sql } from 'drizzle-orm';
@Injectable()
export class ProfileRepository {
  constructor(private drizzle: DrizzleService) {}

  async getUserByUsername(username: string) {
    return await this.drizzle.db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        bio: true,
        joinedAt: true,
      },
    });
  }


  async updateProfile(userId: string, updateData: Partial<typeof users.$inferInsert>) {
    // Ensure only specific fields can be updated
    const allowedFields = {
      fullName: updateData.fullName,
      bio: updateData.bio,
      avatar: updateData.avatar,
    };

    return await this.drizzle.db
      .update(users)
      .set({
        ...allowedFields,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        bio: users.bio,
        avatar: users.avatar,
      });
  }


  async getUserOwnPages(userId: string){
    const userPages = await this.drizzle.db
      .select({
        id: pages.id,
        name: pages.name,
        description: pages.description,
        slug: pages.slug,
        websiteUrl: pages.websiteUrl,
        avatar: pages.avatar,
        cover: pages.cover,
        category: pages.category,
        why: pages.why,
        how: pages.how,
        what: pages.what,
        countryId: pages.countryId,
        cityId: pages.cityId,
        createdAt: pages.createdAt,
        followersCount: sql<number>`CAST(COUNT(DISTINCT ${pagesFollowers.userId}) AS INT)`,
      })
      .from(pages)
      .leftJoin(pagesFollowers, eq(pagesFollowers.pageId, pages.id))
      .where(eq(pages.ownerId, userId))
      .groupBy(pages.id);

    return userPages;
  }


  async getUserOwnGroups(userId: string) {
    const userGroups = await this.drizzle.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        cover: groups.cover,
        topicId: groups.topicId,
        privacy: groups.privacy,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
        membersCount: sql<number>`CAST(COUNT(DISTINCT ${groupMembers.userId}) AS INT)`
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
      .where(eq(groups.ownerId, userId))
      .groupBy(groups.id);

    return userGroups;
  }
}
