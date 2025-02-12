import { Injectable } from '@nestjs/common';
import { eq, SQL, and } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { publicationsComments } from 'src/modules/db/schemas/posts/comments-likes';
import { posts } from 'src/modules/db/schemas/schema';

@Injectable()
export class CommentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createComment(createCommentDto: {
    content: string;
    userId: string;
    postId: string;
  }) {
    const comment = await this.drizzleService.db
      .insert(publicationsComments)
      .values({
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        publicationId: createCommentDto.postId,
        publicationType: 'post',
      })
      .returning();
    return comment[0];
  }

  async findById(id: string) {
    const [comment] = await this.drizzleService.db
      .select({
        id: publicationsComments.id,
        publicationId: publicationsComments.publicationId,
      })
      .from(publicationsComments)
      .where(
        and(
          eq(publicationsComments.id, id),
          eq(publicationsComments.publicationType, 'post'),
        ),
      );
    return comment;
  }

  async getCommentsByPostId(
    postId: string,
    pagination: { limit: number; page: number },
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
    return await this.drizzleService.db.query.publicationsComments.findMany({
      where: eq(publicationsComments.publicationId, postId),
      columns: {
        id: true,
        publicationId: true,
        content: true,
        mediaUrl: true,
        createdAt: true,
      },
      with: {
        author: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
      limit: limit,
      offset: offset,
    });
  }
}
