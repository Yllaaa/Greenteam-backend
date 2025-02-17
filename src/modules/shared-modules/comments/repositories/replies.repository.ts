import { Injectable } from '@nestjs/common';
import { eq, SQL, and } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { commentsReplies } from 'src/modules/db/schemas/posts/comments-likes';

@Injectable()
export class RepliesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createCommentReply(createCommentDto: any) {
    const reply = await this.drizzleService.db
      .insert(commentsReplies)
      .values({
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        commentId: createCommentDto.commentId,
      })
      .returning();
    return reply[0];
  }

  async findById(id: string): Promise<CommentReply | null> {
    const reply = await this.drizzleService.db.query.commentsReplies.findFirst({
      columns: {
        id: true,
        commentId: true,
        content: true,
        mediaUrl: true,
        createdAt: true,
      },
      where: eq(commentsReplies.id, id),
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
    });

    return reply as CommentReply;
  }

  async getRepliesByCommentId(
    commentId: string,
    pagination: { limit: number; page: number },
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
    return await this.drizzleService.db.query.commentsReplies.findMany({
      where: eq(commentsReplies.commentId, commentId),
      columns: {
        id: true,
        commentId: true,
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
      limit,
      offset,
    });
  }

  async deleteReply(id: string, userId: string) {
    return this.drizzleService.db
      .delete(commentsReplies)
      .where(
        and(eq(commentsReplies.id, id), eq(commentsReplies.userId, userId)),
      )
      .execute();
  }
}
