import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import {
  entitiesMedia,
  followers,
  groupMembers,
  groups,
  MarketType,
  MediaType,
  pages,
  pagesFollowers,
  posts,
  postSubTopics,
  products,
  publicationsComments,
  publicationsReactions,
  topics,
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
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { EventResponse } from 'src/modules/events/events/interfaces/events.interface';
import { GetAllProductsDto } from 'src/modules/marketplace/dtos/getAllProducts.dto';
import { PaginationDto } from '../favorites/dto/paginations.dto';

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

  async getUserPages(
    ownerId: string,
    userId: string,
    pagination?: PaginationDto,
  ) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    const pagesList = await this.drizzleService.db.query.pages.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        why: true,
        what: true,
        how: true,
        avatar: true,
        cover: true,
        category: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (pages, { desc }) => [desc(pages.createdAt)],
      limit,
      offset,
      where: eq(pages.ownerId, ownerId),
      extras: {
        followersCount: sql<number>`(
          SELECT CAST(count(*) AS INTEGER)
          FROM ${pagesFollowers} pf
          WHERE pf.page_id = ${pages.id}
        )`
          .mapWith(Number)
          .as('followers_count'),
        isFollowing: sql<boolean>`(
          SELECT EXISTS(
            SELECT 1
            FROM ${pagesFollowers} pf
            WHERE pf.page_id = ${pages.id} AND pf.user_id = ${userId}
          )
        )`
          .mapWith(Boolean)
          .as('is_following'),
      },
    });
    return pagesList;
  }

  async getUserGroups(
    ownerId: string,
    userId: string,
    pagination?: PaginationDto,
  ) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
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

    let whereConditions: SQL<unknown> | undefined;
    whereConditions = eq(groups.ownerId, ownerId);

    const groupsWithMetadata = await this.drizzleService.db
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

  async getUserReactedPosts(
    userId: string,
    mainTopicId?: number,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    const userReactions = this.drizzleService.db
      .select({
        reactionableId: publicationsReactions.reactionableId,
        reactionType: publicationsReactions.reactionType,
      })
      .from(publicationsReactions)
      .where(eq(publicationsReactions.userId, userId))
      .as('user_reactions');

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

    const queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
        },
        author: {
          id: sql<string>`CASE 
                    WHEN ${posts.creatorType} = 'page' THEN ${pages.id}
                    ELSE ${users.id}
                  END`,
          name: sql<string>`CASE 
                    WHEN ${posts.creatorType} = 'page' THEN ${pages.name}
                    ELSE ${users.fullName}
                  END`,
          avatar: sql<string>`CASE 
                    WHEN ${posts.creatorType} = 'page' THEN ${pages.avatar}
                    ELSE ${users.avatar}
                  END`,
          username: sql<string>`CASE 
                    WHEN ${posts.creatorType} = 'page' THEN ${pages.slug}
                    ELSE ${users.username}
                  END`,
          type: posts.creatorType,
        },
        media: sql<
          Array<{
            id: string;
            mediaUrl: string;
            mediaType: MediaType;
          }>
        >`
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', ${entitiesMedia.id},
            'mediaUrl', ${entitiesMedia.mediaUrl},
            'mediaType', ${entitiesMedia.mediaType}
          )
        ) FILTER (WHERE ${entitiesMedia.id} IS NOT NULL),
        '[]'::jsonb
      )
      `.as('media'),
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
      .leftJoin(pages, eq(posts.creatorId, pages.id))
      .leftJoin(entitiesMedia, eq(posts.id, entitiesMedia.parentId))
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
        users.id,
        pages.id,
        entitiesMedia.id,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
        userReactions.reactionType,
      )
      .orderBy(desc(posts.createdAt));

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

  async getUserCommentedPosts(
    userId: string,
    mainTopicId?: number,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    const latestUserComments = this.drizzleService.db
      .select({
        publicationId: publicationsComments.publicationId,
        latestCommentDate: sql<Date>`MAX(${publicationsComments.createdAt})`.as(
          'latest_comment_date',
        ),
      })
      .from(publicationsComments)
      .where(
        and(
          eq(publicationsComments.userId, userId),
          eq(publicationsComments.publicationType, 'post'),
        ),
      )
      .groupBy(publicationsComments.publicationId)
      .as('latest_user_comments');

    const userComments = this.drizzleService.db
      .select({
        publicationId: publicationsComments.publicationId,
        content: publicationsComments.content,
        mediaUrl: publicationsComments.mediaUrl,
        createdAt: publicationsComments.createdAt,
        id: publicationsComments.id,
      })
      .from(publicationsComments)
      .where(
        and(
          eq(publicationsComments.userId, userId),
          eq(publicationsComments.publicationType, 'post'),
        ),
      )
      .as('user_comments');

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

    const queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
        },
        author: {
          id: sql<string>`CASE 
                  WHEN ${posts.creatorType} = 'page' THEN ${pages.id}
                  ELSE ${users.id}
                END`,
          name: sql<string>`CASE 
                  WHEN ${posts.creatorType} = 'page' THEN ${pages.name}
                  ELSE ${users.fullName}
                END`,
          avatar: sql<string>`CASE 
                  WHEN ${posts.creatorType} = 'page' THEN ${pages.avatar}
                  ELSE ${users.avatar}
                END`,
          username: sql<string>`CASE 
                  WHEN ${posts.creatorType} = 'page' THEN ${pages.slug}
                  ELSE ${users.username}
                END`,
          type: posts.creatorType,
        },
        media: sql<
          Array<{
            id: string;
            mediaUrl: string;
            mediaType: MediaType;
          }>
        >`
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', ${entitiesMedia.id},
            'mediaUrl', ${entitiesMedia.mediaUrl},
            'mediaType', ${entitiesMedia.mediaType}
          )
        ) FILTER (WHERE ${entitiesMedia.id} IS NOT NULL),
        '[]'::jsonb
      )
      `.as('media'),
        //      latestCommentDate: latestUserComments.latestCommentDate,
        userComments: sql<
          Array<{
            id: string;
            content: string;
            createdAt: Date;
          }>
        >`
        jsonb_agg(
          jsonb_build_object(
            'id', ${userComments.id},
            'content', ${userComments.content},
            'createdAt', ${userComments.createdAt}
          )
          ORDER BY ${userComments.createdAt} DESC
        )
        `.as('user_comments'),
      })
      .from(posts)
      .innerJoin(
        latestUserComments,
        eq(posts.id, latestUserComments.publicationId),
      )
      .innerJoin(userComments, eq(posts.id, userComments.publicationId))
      .leftJoin(users, eq(posts.creatorId, users.id))
      .leftJoin(pages, eq(posts.creatorId, pages.id))
      .leftJoin(entitiesMedia, eq(posts.id, entitiesMedia.parentId))
      .leftJoin(
        reactionsAggregation,
        eq(posts.id, reactionsAggregation.reactionableId),
      )
      .groupBy(
        posts.id,
        users.id,
        pages.id,
        latestUserComments.latestCommentDate,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
      )
      .orderBy(desc(latestUserComments.latestCommentDate));

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

  async getUserPosts(
    userId: string,
    filters?: {
      mainTopicId?: number;
    },
    pagination?: {
      limit?: number;
      page?: number;
    },
    currentUserId?: string,
  ) {
    const { mainTopicId } = filters || {};
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

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

    const userReaction = this.drizzleService.db
      .select({
        reactionableId: publicationsReactions.reactionableId,
        userReactionType: sql<string | null>`
            MAX(CASE 
              WHEN ${publicationsReactions.reactionType} IN ('like', 'dislike') 
              THEN ${publicationsReactions.reactionType}
              ELSE NULL
            END)
          `.as('user_reaction_type'),
        hasDoReaction: sql<boolean>`
            BOOL_OR(${publicationsReactions.reactionType} = 'do')
          `.as('has_do_reaction'),
      })
      .from(publicationsReactions)
      .where(
        currentUserId
          ? eq(publicationsReactions.userId, currentUserId)
          : sql`1=1`,
      )
      .groupBy(publicationsReactions.reactionableId)
      .as('user_reaction');

    const queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
        },
        author: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar,
        },
        media: sql<
          Array<{
            id: string;
            mediaUrl: string;
            mediaType: MediaType;
          }>
        >`
        COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'id', ${entitiesMedia.id},
              'mediaUrl', ${entitiesMedia.mediaUrl},
              'mediaType', ${entitiesMedia.mediaType}
            )
          ) FILTER (WHERE ${entitiesMedia.id} IS NOT NULL),
          '[]'::jsonb
        )
        `.as('media'),
        commentCount: this.commentCountQuery,
        likeCount:
          sql<number>`COALESCE(${reactionsAggregation.likeCount}, 0)`.as(
            'like_count',
          ),
        dislikeCount:
          sql<number>`COALESCE(${reactionsAggregation.dislikeCount}, 0)`.as(
            'dislike_count',
          ),
        userReactionType: sql<
          string | null
        >`COALESCE(${userReaction.userReactionType}, NULL)`.as(
          'user_reaction_type',
        ),
        hasDoReaction:
          sql<boolean>`COALESCE(${userReaction.hasDoReaction}, false)`.as(
            'has_do_reaction',
          ),
      })
      .from(posts)
      .leftJoin(users, eq(posts.creatorId, users.id))
      .leftJoin(
        publicationsComments,
        eq(posts.id, publicationsComments.publicationId),
      )
      .leftJoin(
        reactionsAggregation,
        eq(posts.id, reactionsAggregation.reactionableId),
      )
      .leftJoin(userReaction, eq(posts.id, userReaction.reactionableId))
      .leftJoin(entitiesMedia, eq(posts.id, entitiesMedia.parentId))
      .groupBy(
        posts.id,
        posts.content,
        posts.createdAt,
        posts.groupId,
        users.id,
        users.fullName,
        users.avatar,
        users.username,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
        userReaction.userReactionType,
        userReaction.hasDoReaction,
      )
      .orderBy(desc(posts.createdAt));

    const conditions: SQL[] = [];

    const cond = and(
      eq(posts.creatorId, userId),
      eq(posts.creatorType, 'user'),
    );
    if (cond) {
      conditions.push(cond);
    }

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


  async getUserCreatedEvents(
    userId: string,
    dto: GetEventsDto,
  ): Promise<EventResponse[]> {
    const { page, limit, category, countryId, cityId } = dto;
    const offset = Math.max(0, (page - 1) * limit);
    
    const userEvents = await this.drizzleService.db.query.events.findMany({
      columns: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        category: true,
        posterUrl: true,
        hostedBy: true,
      },
      offset: offset,
      limit: limit,
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      where: (events, { and, eq }) =>
        and(
          eq(events.creatorId, userId),
          eq(events.creatorType, 'user'),
          category ? eq(events.category, category) : undefined,
          cityId ? eq(events.cityId, cityId) : undefined,
          countryId ? eq(events.countryId, countryId) : undefined,
        ),
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
    
    return userEvents as unknown as EventResponse[];
  }

  async getUserCreatedProducts(
    userId: string,
    dto: GetAllProductsDto,
  ) {
    const { page = 1, limit = 10, topicId, countryId, cityId, marketType } = dto;
    const offset = Math.max(0, (page - 1) * limit);
    
    const query = this.drizzleService.db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        marketType: products.marketType,
        isHidden: products.isHidden,
        topicId: products.topicId,
        countryId: products.countryId,
        cityId: products.cityId,
        createdAt: products.createdAt,
        images: sql<Array<{ id: string; mediaUrl: string; mediaType: MediaType }>>`
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', ${entitiesMedia.id},
                'mediaUrl', ${entitiesMedia.mediaUrl},
                'mediaType', ${entitiesMedia.mediaType}
              )
            ) FILTER (WHERE ${entitiesMedia.id} IS NOT NULL),
            '[]'::jsonb
          )
        `.as('images'),
      })
      .from(products)
      .leftJoin(
        entitiesMedia,
        and(
          eq(products.id, entitiesMedia.parentId),
          eq(entitiesMedia.parentType, 'product')
        )
      )
      .where(
        and(
          eq(products.sellerId, userId),
          eq(products.sellerType, 'user'),
          topicId ? eq(products.topicId, topicId) : undefined,
          countryId ? eq(products.countryId, countryId) : undefined,
          cityId ? eq(products.cityId, cityId) : undefined,
          marketType ? eq(products.marketType, marketType as MarketType) : undefined
        )
      )
      .groupBy(products.id)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
    
    const userProducts = await query.execute();
    
    return userProducts;
  }
  
  private readonly commentCountQuery = sql<number>`
  COUNT(DISTINCT ${publicationsComments.id})
`.as('comment_count');
}
