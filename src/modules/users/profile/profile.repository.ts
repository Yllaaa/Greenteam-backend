import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { groupMembers, groups, pages, pagesFollowers, posts, postSubTopics, publicationsComments, publicationsReactions, users } from '../../db/schemas/schema';
import { eq, or, sql, and, SQL, exists, desc } from 'drizzle-orm';
@Injectable()
export class ProfileRepository {
  constructor(private readonly drizzleService: DrizzleService) { }

  async getUserByUsername(username: string) {
    return await this.drizzleService.db.query.users.findFirst({
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

  async updateProfile(
    userId: string,
    updateData: Partial<typeof users.$inferInsert>,
  ) {
    // Ensure only specific fields can be updated
    const allowedFields = {
      fullName: updateData.fullName,
      bio: updateData.bio,
      avatar: updateData.avatar,
    };

    return await this.drizzleService.db
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

  async getUserOwnPages(userId: string) {
    const userPages = await this.drizzleService.db
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
    const userGroups = await this.drizzleService.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        banner: groups.banner,
        topicId: groups.topicId,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
        membersCount: sql<number>`CAST(COUNT(DISTINCT ${groupMembers.userId}) AS INT)`,
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
      .where(eq(groups.ownerId, userId))
      .groupBy(groups.id);

    return userGroups;
  }

  async getUserLikedDislikedPosts(
    userId: string,
    mainTopicId?: number,
    pagination?: {
      limit?: number;
      page?: number;
    }
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    let conditions = and(
      eq(publicationsReactions.userId, userId),
      eq(publicationsReactions.reactionableType, 'post'),
      or(
        eq(publicationsReactions.reactionType, 'like'),
        eq(publicationsReactions.reactionType, 'dislike')
      )
    );

    if (mainTopicId !== undefined) {
      conditions = and(conditions, eq(posts.mainTopicId, mainTopicId));
    }

    const query = this.drizzleService.db
      .select({
        id: posts.id,
        content: posts.content,
        mainTopicId: posts.mainTopicId,
        creatorType: posts.creatorType,
        creatorId: posts.creatorId,
        groupId: posts.groupId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        reactionType: publicationsReactions.reactionType,
      })
      .from(publicationsReactions)
      .innerJoin(
        posts,
        eq(publicationsReactions.reactionableId, posts.id)
      )
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));

    return await query;
  }

}
