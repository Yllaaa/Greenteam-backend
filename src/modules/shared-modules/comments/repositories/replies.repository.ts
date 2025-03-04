import { Injectable } from '@nestjs/common';
import { eq, SQL, and, sql, desc } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  commentsReplies,
  publicationsReactions,
} from 'src/modules/db/schemas/posts/comments-likes';
import { users } from 'src/modules/db/schemas/schema';

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
    currentUserId?: string,
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    const reactionCountSubquery = this.drizzleService.db
      .select({
        replyId: publicationsReactions.reactionableId,
        likeCount: sql<number>`
          COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'like' THEN 1 END)
        `.as('like_count'),
        dislikeCount: sql<number>`
          COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'dislike' THEN 1 END)
        `.as('dislike_count'),
      })
      .from(publicationsReactions)
      .where(eq(publicationsReactions.reactionableType, 'reply'))
      .groupBy(publicationsReactions.reactionableId)
      .as('reaction_counts');

    return await this.drizzleService.db
      .select({
        id: commentsReplies.id,
        commentId: commentsReplies.commentId,
        content: commentsReplies.content,
        mediaUrl: commentsReplies.mediaUrl,
        createdAt: commentsReplies.createdAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          avatar: users.avatar,
        },
        likeCount:
          sql<number>`COALESCE(${reactionCountSubquery.likeCount}, 0)`.as(
            'like_count',
          ),
        dislikeCount:
          sql<number>`COALESCE(${reactionCountSubquery.dislikeCount}, 0)`.as(
            'dislike_count',
          ),
        userReaction: sql<string | null>`
          CASE 
            WHEN ${publicationsReactions.userId} = ${currentUserId} 
            THEN ${publicationsReactions.reactionType} 
            ELSE NULL 
          END
        `.as('user_reaction'),
      })
      .from(commentsReplies)
      .leftJoin(users, eq(commentsReplies.userId, users.id))
      .leftJoin(
        reactionCountSubquery,
        eq(commentsReplies.id, reactionCountSubquery.replyId),
      )
      .leftJoin(
        publicationsReactions,
        and(
          eq(commentsReplies.id, publicationsReactions.reactionableId),
          eq(publicationsReactions.reactionableType, 'reply'),
          eq(publicationsReactions.userId, currentUserId || ''),
        ),
      )
      .where(eq(commentsReplies.commentId, commentId))
      .groupBy(
        commentsReplies.id,
        users.id,
        reactionCountSubquery.likeCount,
        reactionCountSubquery.dislikeCount,
        publicationsReactions.reactionType,
        publicationsReactions.userId,
      )
      .orderBy(desc(commentsReplies.createdAt))
      .limit(limit)
      .offset(offset);
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
