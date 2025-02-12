import { Injectable } from '@nestjs/common';
import { eq, exists, inArray, SQL, and, or, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  posts,
  postSubTopics,
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
        mainTopic: {
          columns: {
            id: true,
            name: true,
          },
        },
        subTopics: {
          columns: {},
          with: {
            topic: {
              columns: {
                id: true,
                name: true,
              },
            },
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
  ) {
    const { mainTopicId, subTopicId } = filters || {};
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
    const queryBuilder = this.drizzleService.db
      .select({
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
        },
        mainTopic: {
          id: topics.id,
          name: topics.name,
        },
        userCreator: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
          username: users.username,
        },
      })
      .from(posts)
      .leftJoin(topics, eq(posts.mainTopicId, topics.id))
      .leftJoin(users, eq(posts.creatorId, users.id))
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
}
