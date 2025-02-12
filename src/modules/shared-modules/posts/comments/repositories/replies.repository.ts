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

  async findById(id: string) {
    const [reply] = await this.drizzleService.db
      .select({
        id: commentsReplies.id,
      })
      .from(commentsReplies)
      .where(eq(commentsReplies.id, id));
    return reply;
  }
}
