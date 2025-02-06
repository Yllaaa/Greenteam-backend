import { Injectable } from '@nestjs/common';
import { eq, SQL } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { posts, postSubTopics } from 'src/modules/db/schemas/schema';

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
}
