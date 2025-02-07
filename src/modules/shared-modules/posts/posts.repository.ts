import { Injectable } from '@nestjs/common';
import { eq, inArray, SQL } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { posts, postSubTopics, topics } from 'src/modules/db/schemas/schema';

@Injectable()
export class PostsRepository {
  constructor(private readonly drizzleService: DrizzleService) { }

  async createPost(
    content: string,
    mainTopicId: string,
    creatorId: string,
    creatorType: SQL<'user' | 'page' | 'group_member'>,
    userId: string,
  ) {
    const [post] = await this.drizzleService.db
      .insert(posts)
      .values({
        content,
        mainTopicId,
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

  async addSubtopic(postId: string, topicId: string) {
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

  async getPostsByMainTopic(topic: string, offset: number, limit: number) {
    const topic_posts = this.drizzleService.db
      .select({ post_id: posts.id })
      .from(posts)
      .innerJoin(topics, eq(topics.id, posts.mainTopicId))
      .where(eq(topics.name, topic))
    return await this.drizzleService.db.query.posts.findMany({
      offset: offset,
      limit: limit,
      with: {
        user_creator: {
          columns: {
            fullName: true,
            avatar: true,
          }
        },
        comments: true
      },
      where: inArray(posts.id, topic_posts),
    })
  }

  async getPostsBySubTopic(subTopic: string, offset: number, limit: number) {
    const subTopic_posts = this.drizzleService.db
      .select({ post_id: posts.id })
      .from(posts)
      .innerJoin(postSubTopics, eq(posts.id, postSubTopics.postId))
      .innerJoin(topics, eq(topics.id, postSubTopics.topicId))
      .where(eq(topics.name, subTopic))
    return await this.drizzleService.db.query.posts.findMany({
      offset: offset,
      limit: limit,
      with: {
        user_creator: {
          columns: {
            fullName: true,
            avatar: true,
          }
        },
        comments: true
      },
      where: inArray(posts.id, subTopic_posts),
    })
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
          }
        },
        comments: true
      }
    });
  }
}
