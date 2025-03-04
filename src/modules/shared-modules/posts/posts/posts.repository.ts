import { Injectable } from '@nestjs/common';
import { eq, exists, inArray, SQL, and, or, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  posts,
  postSubTopics,
  publicationsComments,
  publicationsReactions,
  topics,
  users,
} from 'src/modules/db/schemas/schema';

@Injectable()
export class PostsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findById(id: string) {
    const [post] = await this.drizzleService.db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post;
  }

  async createPost(
    content: string,
    mainTopicId: number,
    creatorId: string,
    creatorType: SQL<'user' | 'page' | 'group_member'>,
    userId: string,
  ) {
    const [post] = await this.drizzleService.db
      .insert(posts)
      .values({
        content,
        mainTopicId: Number(mainTopicId),
        creatorId: creatorId ?? userId,
        creatorType,
      })
      .returning({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
      });

    return post;
  }

  async addSubtopic(postId: string, topicId: number) {
    return await this.drizzleService.db
      .insert(postSubTopics)
      .values({ postId, topicId });
  }

  async getPostById(postId: string) {
    return await this.drizzleService.db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: {
        id: true,
        content: true,
        createdAt: true,
      },
      with: {
        user_creator: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getFilteredPosts(
    filters?: {
      mainTopicId?: number;
      subTopicId?: number;
    },
    pagination?: {
      limit?: number;
      page?: number;
    },
    currentUserId?: string,
  ) {
    const { mainTopicId, subTopicId } = filters || {};
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
          CASE 
            WHEN ${publicationsReactions.reactionType} IN ('like', 'dislike') 
            THEN ${publicationsReactions.reactionType}
            ELSE NULL
          END
        `.as('user_reaction_type'),
        hasDoReaction: sql<boolean>`
          ${publicationsReactions.reactionType} = 'do'
        `.as('has_do_reaction'),
      })
      .from(publicationsReactions)
      .where(
        currentUserId
          ? eq(publicationsReactions.userId, currentUserId)
          : sql`1=1`,
      )
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
          fullName: users.fullName,
          avatar: users.avatar,
          username: users.username,
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
      .groupBy(
        posts.id,
        posts.content,
        posts.createdAt,
        users.id,
        users.fullName,
        users.avatar,
        users.username,
        reactionsAggregation.likeCount,
        reactionsAggregation.dislikeCount,
        userReaction.userReactionType,
        userReaction.hasDoReaction,
      )
      .orderBy(posts.createdAt);

    const conditions: SQL[] = [];

    if (mainTopicId) {
      conditions.push(eq(posts.mainTopicId, mainTopicId));
    }

    if (subTopicId) {
      conditions.push(
        exists(
          this.drizzleService.db
            .select()
            .from(postSubTopics)
            .where(
              and(
                eq(postSubTopics.postId, posts.id),
                eq(postSubTopics.topicId, Number(subTopicId)),
              ),
            )
            .orderBy(posts.createdAt),
        ),
      );
    }

    if (conditions.length > 0) {
      queryBuilder.where(or(...conditions));
    }

    const paginatedQuery = queryBuilder.limit(limit).offset(offset);

    const data = await paginatedQuery.execute();

    return data;
  }

  async getAllPosts(offset: number, limit: number) {
    return await this.drizzleService.db.query.posts.findMany({
      offset: offset,
      limit: limit,
      with: {
        user_creator: {
          columns: {
            fullName: true,
            avatar: true,
          },
        },
        comments: true,
      },
    });
  }

  private readonly commentCountQuery = sql<number>`
  COUNT(DISTINCT ${publicationsComments.id})
`.as('comment_count');

  private readonly reactionCountQueries = {
    like: sql<number>`
    COUNT(CASE 
      WHEN ${publicationsReactions.reactionType} = 'like' 
      THEN 1 
    END)
  `.as('like_count'),

    dislike: sql<number>`
    COUNT(CASE 
      WHEN ${publicationsReactions.reactionType} = 'dislike' 
      THEN 1 
    END)
  `.as('dislike_count'),
  };
}
