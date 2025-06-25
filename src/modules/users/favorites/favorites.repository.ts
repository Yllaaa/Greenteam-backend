import { Injectable } from '@nestjs/common';
import { eq, SQL, desc, sql, and, or, exists, inArray } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  entitiesMedia,
  events,
  favoriteProducts,
  followers,
  groupMembers,
  groups,
  MediaType,
  pages,
  pagesFollowers,
  posts,
  products,
  publicationsComments,
  publicationsReactions,
  topics,
  users,
  usersJoinedEvent,
} from 'src/modules/db/schemas/schema';
import { EventResponse } from 'src/modules/events/events/interfaces/events.interface';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  private readonly commentCountQuery = sql<number>`
    COUNT(DISTINCT ${publicationsComments.id})
  `.as('comment_count');

  private getPaginationParams(pagination?: { limit?: number; page?: number }) {
    const { limit = 10, page = 1 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
    return { limit, offset };
  }

  private getUserReactionsSubquery(userId: string) {
    return this.drizzleService.db
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
      .where(userId ? eq(publicationsReactions.userId, userId) : sql`1=1`)
      .groupBy(publicationsReactions.reactionableId)
      .as('user_reaction');
  }

  private getReactionsAggregationSubquery() {
    return this.drizzleService.db
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
  }

  private getMediaAggregation() {
    return sql<
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
    `.as('media');
  }

  private buildPostQuery(
    userId: string,
    condition: SQL,
    queryModifier?: (query: any) => any,
  ) {
    const userReactions = this.getUserReactionsSubquery(userId);
    const reactionsAggregation = this.getReactionsAggregationSubquery();

    let queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
          groupId: posts.groupId,
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
        media: this.getMediaAggregation(),
        commentCount: this.commentCountQuery,
        likeCount:
          sql<number>`COALESCE(${reactionsAggregation.likeCount}, 0)`.as(
            'like_count',
          ),
        dislikeCount:
          sql<number>`COALESCE(${reactionsAggregation.dislikeCount}, 0)`.as(
            'dislike_count',
          ),
        userReactionType: userReactions.userReactionType,
        hasDoReaction:
          sql<boolean>`COALESCE(${userReactions.hasDoReaction}, false)`.as(
            'has_do_reaction',
          ),
      })
      .from(posts)
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
      .leftJoin(userReactions, eq(posts.id, userReactions.reactionableId))
      .where(condition)
      .groupBy(
        posts.id,
        posts.content,
        posts.createdAt,
        posts.groupId,
        posts.creatorType,
        users.id,
        users.fullName,
        users.avatar,
        users.username,
        pages.id,
        pages.name,
        pages.avatar,
        pages.slug,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
        userReactions.userReactionType,
        userReactions.hasDoReaction,
      )
      .orderBy(desc(posts.createdAt));

    if (queryModifier) {
      queryBuilder = queryModifier(queryBuilder);
    }

    return queryBuilder;
  }

  async getUserLikedPosts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);

    const userLikedReactions = this.drizzleService.db
      .select({
        reactionableId: publicationsReactions.reactionableId,
      })
      .from(publicationsReactions)
      .where(
        and(
          eq(publicationsReactions.userId, userId),
          eq(publicationsReactions.reactionType, 'like'),
        ),
      )
      .as('user_liked_posts');

    const condition = sql`${posts.id} IN (SELECT ${userLikedReactions.reactionableId} FROM ${userLikedReactions})`;

    if (!condition) {
      throw new Error('Condition must be defined');
    }

    const queryBuilder = this.buildPostQuery(userId, condition);
    const data = await queryBuilder.limit(limit).offset(offset).execute();

    return data;
  }

  async getFollowingsPosts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);

    const followingsSubquery = this.drizzleService.db
      .select({
        followingId: followers.followingId,
      })
      .from(followers)
      .where(eq(followers.followerId, userId))
      .as('followings_list');
    const condition = and(
      eq(posts.creatorType, 'user'),
      sql`${posts.creatorId} IN (SELECT ${followingsSubquery.followingId} FROM ${followingsSubquery})`,
    );

    if (!condition) {
      throw new Error('Condition must be defined');
    }

    const queryBuilder = this.buildPostQuery(userId, condition);
    const data = await queryBuilder.limit(limit).offset(offset).execute();

    return data;
  }

  async getFollowedPagesPosts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);

    const followedPagesSubquery = this.drizzleService.db
      .select({
        pageId: pagesFollowers.pageId,
      })
      .from(pagesFollowers)
      .where(eq(pagesFollowers.userId, userId))
      .as('followed_pages');

    const condition = and(
      eq(posts.creatorType, 'page'),
      sql`${posts.creatorId} IN (SELECT ${followedPagesSubquery.pageId} FROM ${followedPagesSubquery})`,
    );
    if (!condition) {
      throw new Error('Condition must be defined');
    }
    const queryBuilder = this.buildPostQuery(userId, condition);
    const data = await queryBuilder.limit(limit).offset(offset).execute();

    return data;
  }

  async getJoinedGroupsPosts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);

    const userGroupsSubquery = this.drizzleService.db
      .select({
        groupId: groupMembers.groupId,
      })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId))
      .as('user_groups');

    const condition = sql`${posts.groupId} IN (SELECT ${userGroupsSubquery.groupId} FROM ${userGroupsSubquery})`;

    const queryBuilder = this.buildPostQuery(userId, condition);
    const data = await queryBuilder.limit(limit).offset(offset).execute();

    return data;
  }

  async getFollowedPages(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);

    const followedPages = await this.drizzleService.db
      .select({
        id: pages.id,
        name: pages.name,
        slug: pages.slug,
        why: pages.why,
        what: pages.what,
        how: pages.how,
        avatar: pages.avatar,
        cover: pages.cover,
        category: pages.category,
        topic: {
          id: topics.id,
          name: topics.name,
        },
        followersCount: sql<number>`(
          SELECT CAST(count(*) AS INTEGER)
          FROM ${pagesFollowers} pf
          WHERE pf.page_id = ${pages.id}
        )`
          .mapWith(Number)
          .as('followers_count'),
      })
      .from(pages)
      .innerJoin(
        pagesFollowers,
        and(
          eq(pagesFollowers.pageId, pages.id),
          eq(pagesFollowers.userId, userId),
        ),
      )
      .leftJoin(topics, eq(pages.topicId, topics.id))
      .orderBy(desc(pagesFollowers.followedAt))
      .limit(limit)
      .offset(offset);

    return followedPages;
  }

  async getUserJoinedGroups(
    userId: string,
    query?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(query);

    return await this.drizzleService.db
      .select({
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
      })
      .from(groups)
      .innerJoin(
        groupMembers,
        and(
          eq(groups.id, groupMembers.groupId),
          eq(groupMembers.userId, userId),
        ),
      )
      .leftJoin(topics, eq(topics.id, groups.topicId))
      .groupBy(groups.id, topics.id, topics.name, groupMembers.joinedAt)
      .orderBy(desc(groupMembers.joinedAt))
      .limit(limit)
      .offset(offset);
  }

  async getJoinedEvents(
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<EventResponse[]> {
    const { limit, offset } = this.getPaginationParams(pagination);

    const joinedEvents = await this.drizzleService.db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        category: events.category,
        posterUrl: events.posterUrl,
        hostedBy: events.hostedBy,
        creatorType: events.creatorType,
        userCreator: {
          id: users.id,
          fullName: users.fullName,
        },
        pageCreator: {
          id: pages.id,
          name: pages.name,
        },
      })
      .from(events)
      .innerJoin(
        usersJoinedEvent,
        and(
          eq(usersJoinedEvent.eventId, events.id),
          eq(usersJoinedEvent.userId, userId),
        ),
      )
      .leftJoin(users, eq(users.id, events.creatorId))
      .leftJoin(pages, eq(pages.id, events.creatorId))
      .orderBy(desc(events.startDate))
      .limit(limit)
      .offset(offset);

    return joinedEvents as unknown as EventResponse[];
  }

  async getUserFavoriteProducts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const { limit, offset } = this.getPaginationParams(pagination);
    const result = await this.drizzleService.db.query.products.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        marketType: true,
        sellerId: true,
        sellerType: true,
        countryId: true,
        cityId: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
        images: {
          columns: {
            id: true,
            mediaUrl: true,
            mediaType: true,
          },
        },
      },
      where: inArray(
        products.id,
        this.drizzleService.db
          .select({ productId: favoriteProducts.productId })
          .from(favoriteProducts)
          .where(eq(favoriteProducts.userId, userId)),
      ),
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      extras: {
        isFavorited: sql<boolean>`true`.as('is_favorited'),
      },
    });

    return result;
  }
}
