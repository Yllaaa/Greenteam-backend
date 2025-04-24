import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import {
  entitiesMedia,
  followers,
  groupMembers,
  groups,
  pages,
  pagesFollowers,
  posts,
  postSubTopics,
  publicationsComments,
  publicationsReactions,
  userBlocks,
  userPoints,
  users,
} from '../../db/schemas/schema';
import {
  eq,
  or,
  sql,
  and,
  SQL,
  exists,
  desc,
  inArray,
  ne,
  sum,
} from 'drizzle-orm';
@Injectable()
export class ProfileRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getUserProfile(id: string, currentUserId?: string) {
    const user = await this.drizzleService.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        fullName: true,
        username: true,
        avatar: true,
        cover: true,
        bio: true,
        joinedAt: true,
      },
      extras: currentUserId
        ? {
            isFollowing: sql<boolean>`
        EXISTS (
          SELECT 1 FROM ${followers}
          WHERE ${followers.followerId} = ${currentUserId}
          AND ${followers.followingId} = ${id}
        )
      `.as('isFollowing'),

            isFollower: sql<boolean>`
        EXISTS (
          SELECT 1 FROM ${followers}
          WHERE ${followers.followerId} = ${id}
          AND ${followers.followingId} = ${currentUserId}
        )
      `.as('isFollower'),

            isBlocked: sql<boolean>`
        EXISTS (
          SELECT 1 FROM ${userBlocks}
          WHERE ${userBlocks.userId} = ${currentUserId}
          AND ${userBlocks.blockedId} = ${id}
          AND ${userBlocks.blockedEntityType} = 'user'
        )
      `.as('isBlocked'),
          }
        : undefined,
    });

    return user;
  }

  async getUserScore(userId: string) {
    const result = await this.drizzleService.db
      .select({ totalPoints: sum(userPoints.points) })
      .from(userPoints)
      .where(eq(userPoints.userId, userId));
    return Number(result[0]?.totalPoints) ?? 0;
  }

  async getUserByUsername(username: string) {
    return await this.drizzleService.db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
      },
    });
  }

  async updateProfile(
    updateData: {
      fullName: string;
      bio: string;
      username: string;
      avatar: string;
      cover: string;
    },
    userId: string,
  ) {
    const allowedFields = {
      fullName: updateData.fullName,
      bio: updateData.bio,
      avatar: updateData.avatar,
      cover: updateData.cover,
      username: updateData.username,
    };

    const [updatedUser] = await this.drizzleService.db
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
        cover: users.cover,
      });
    return updatedUser;
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
    },
  ) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    // Get all posts that the user has reacted to
    const userReactions = this.drizzleService.db
      .select({
        reactionableId: publicationsReactions.reactionableId,
        reactionType: publicationsReactions.reactionType,
      })
      .from(publicationsReactions)
      .where(eq(publicationsReactions.userId, userId))
      .as('user_reactions');

    // Aggregated reactions for all users
    const reactionsAggregation = this.drizzleService.db
      .select({
        reactionableId: publicationsReactions.reactionableId,
        likeCount: sql<number>`
        COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'like' THEN 1 END)
      `.as('like_count'),
        dislikeCount: sql<number>`
        COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'dislike' THEN 1 END)
      `.as('dislike_count'),
      })
      .from(publicationsReactions)
      .groupBy(publicationsReactions.reactionableId)
      .as('reactions_agg');

    // Query builder for the main query
    const queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
          creatorType: posts.creatorType,
        },
        author: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar,
        },
        commentCount: this.commentCountQuery,
        likeCount:
          sql<number>`COALESCE(${reactionsAggregation.likeCount}, 0)`.as(
            'like_count',
          ),
        dislikeCount:
          sql<number>`COALESCE(${reactionsAggregation.dislikeCount}, 0)`.as(
            'dislike_count',
          ),
        userReactionType: userReactions.reactionType,
        hasDoReaction: sql<boolean>`${userReactions.reactionType} = 'do'`.as(
          'has_do_reaction',
        ),
      })
      .from(posts)
      .innerJoin(userReactions, eq(posts.id, userReactions.reactionableId))
      .leftJoin(users, eq(posts.creatorId, users.id))
      .leftJoin(
        publicationsComments,
        eq(posts.id, publicationsComments.publicationId),
      )
      .leftJoin(
        reactionsAggregation,
        eq(posts.id, reactionsAggregation.reactionableId),
      )
      .groupBy(
        posts.id,
        posts.content,
        posts.createdAt,
        posts.creatorType,
        posts.groupId,
        users.id,
        users.fullName,
        users.avatar,
        users.username,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
        userReactions.reactionType,
      )
      .orderBy(desc(posts.createdAt));

    // Apply additional filters if needed
    const conditions: SQL[] = [];
    if (mainTopicId) {
      conditions.push(eq(posts.mainTopicId, mainTopicId));
    }
    if (conditions.length > 0) {
      queryBuilder.where(and(...conditions));
    }

    const paginatedQuery = queryBuilder.limit(limit).offset(offset);
    const data = await paginatedQuery.execute();
    return data;
  }

  private readonly commentCountQuery = sql<number>`
  COUNT(DISTINCT ${publicationsComments.id})
`.as('comment_count');

  async getUserCommentedPosts(
    userId: string,
    filtration: {
      mainTopicId?: number;
      subTopicId?: number;
    },
    pagination: {
      limit?: number;
      page?: number;
    },
  ) {
    const { mainTopicId, subTopicId } = filtration;
    const { limit = 10, page = 1 } = pagination;

    const offset = Math.max(0, (page - 1) * limit);

    // First, get user comments on posts
    const userComments = await this.drizzleService.db
      .select({
        postId: publicationsComments.publicationId,
      })
      .from(publicationsComments)
      .where(
        and(
          eq(publicationsComments.userId, userId),
          eq(publicationsComments.publicationType, 'post'),
        ),
      );

    if (!userComments.length) {
      return [];
    }

    // Get unique post IDs
    const postIds = [...new Set(userComments.map((c) => c.postId))];

    // Build conditions for filtering posts
    const conditions = [inArray(posts.id, postIds)];
    if (mainTopicId) {
      conditions.push(eq(posts.mainTopicId, mainTopicId));
    }

    // Execute different query based on subTopicId
    let filteredPosts;

    if (subTopicId) {
      filteredPosts = await this.drizzleService.db
        .select({ id: posts.id })
        .from(posts)
        .innerJoin(postSubTopics, eq(postSubTopics.postId, posts.id))
        .where(and(...conditions, eq(postSubTopics.topicId, subTopicId)))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      filteredPosts = await this.drizzleService.db
        .select({ id: posts.id })
        .from(posts)
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    }

    if (!filteredPosts.length) {
      return [];
    }

    // Get filtered post IDs
    const filteredPostIds = filteredPosts.map((post) => post.id);

    // Get detailed information for each post
    const result = await Promise.all(
      filteredPostIds.map(async (postId) => {
        // Get post details
        const post = await this.drizzleService.db.query.posts.findFirst({
          where: eq(posts.id, postId),
          columns: {
            id: true,
            content: true,
            createdAt: true,
            creatorType: true,
            mainTopicId: true,
          },
          with: {
            user_creator: {
              columns: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
            mainTopic: true,
          },
        });

        // Get post media
        const media = await this.drizzleService.db
          .select()
          .from(entitiesMedia)
          .where(
            and(
              eq(entitiesMedia.parentId, postId),
              eq(entitiesMedia.parentType, 'post'),
            ),
          );

        // Get ALL user's comments for this post
        const userComments = await this.drizzleService.db
          .select({
            id: publicationsComments.id,
            content: publicationsComments.content,
            createdAt: publicationsComments.createdAt,
            updatedAt: publicationsComments.updatedAt,
            author: {
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatar: users.avatar,
            },
          })
          .from(publicationsComments)
          .innerJoin(users, eq(publicationsComments.userId, users.id))
          .where(
            and(
              eq(publicationsComments.publicationId, postId),
              eq(publicationsComments.publicationType, 'post'),
              eq(publicationsComments.userId, userId),
            ),
          )
          .orderBy(desc(publicationsComments.createdAt));

        // Get up to 5 other comments (excluding the user's comments)
        const otherComments = await this.drizzleService.db
          .select({
            id: publicationsComments.id,
            content: publicationsComments.content,
            createdAt: publicationsComments.createdAt,
            updatedAt: publicationsComments.updatedAt,
            author: {
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatar: users.avatar,
            },
          })
          .from(publicationsComments)
          .innerJoin(users, eq(publicationsComments.userId, users.id))
          .where(
            and(
              eq(publicationsComments.publicationId, postId),
              eq(publicationsComments.publicationType, 'post'),
              ne(publicationsComments.userId, userId),
            ),
          )
          .orderBy(desc(publicationsComments.createdAt))
          .limit(5);

        return {
          post: {
            ...post,
            media,
          },
          userComments, // All user's comments for this post
          otherComments, // Up to 5 other comments
        };
      }),
    );

    return result;
  }
}
