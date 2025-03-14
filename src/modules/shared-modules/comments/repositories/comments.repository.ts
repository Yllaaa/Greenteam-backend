import { Injectable } from '@nestjs/common';
import { SQL, and, eq, sql, desc } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  events,
  forumPublications,
  posts,
  publicationsComments,
  publicationsReactions,
  users,
} from 'src/modules/db/schemas/schema';
@Injectable()
export class CommentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createComment(
    createCommentDto: {
      content: string;
      userId: string;
      publicationId: string;
    },
    publicationType: SQL<'forum_publication' | 'post' | 'comment' | 'event'>,
  ) {
    const comment = await this.drizzleService.db
      .insert(publicationsComments)
      .values({
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        publicationId: createCommentDto.publicationId,
        publicationType,
      })
      .returning();
    return comment[0];
  }

  async findById(
    id: string,
    publicationType: SQL<'forum_publication' | 'post' | 'comment' | 'event'>,
  ): Promise<Comment | null> {
    const query = {
      where: and(
        eq(publicationsComments.id, id),
        eq(publicationsComments.publicationType, publicationType),
      ),
      columns: {
        id: true,
        content: true,
        mediaUrl: true,
        publicationId: true,
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
        ...(publicationType ===
          ('post' as unknown as SQL<
            'forum_publication' | 'post' | 'comment'
          >) && {
          post: {
            columns: {
              id: true,
              mainTopicId: true,
            },
          },
        }),
        ...(publicationType ===
          ('forum_publication' as unknown as SQL<
            'forum_publication' | 'post' | 'comment'
          >) && {
          forumPublication: {
            columns: {
              id: true,
              mainTopicId: true,
            },
          },
        }),
      },
    };

    const comment =
      await this.drizzleService.db.query.publicationsComments.findFirst(query);

    return comment as Comment;
  }

  async getCommentsByPublicationId(
    publicationId: string,
    pagination: { limit: number; page: number },
    currentUserId?: string,
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);

    // Subquery for reaction counts
    const reactionCountSubquery = this.drizzleService.db
      .select({
        commentId: publicationsReactions.reactionableId,
        likeCount: sql<number>`
          COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'like' THEN 1 END)
        `.as('like_count'), // Adding alias
        dislikeCount: sql<number>`
          COUNT(CASE WHEN ${publicationsReactions.reactionType} = 'dislike' THEN 1 END)
        `.as('dislike_count'), // Adding alias
      })
      .from(publicationsReactions)
      .where(eq(publicationsReactions.reactionableType, 'comment'))
      .groupBy(publicationsReactions.reactionableId)
      .as('reaction_counts');

    return await this.drizzleService.db
      .select({
        id: publicationsComments.id,
        publicationId: publicationsComments.publicationId,
        content: publicationsComments.content,
        mediaUrl: publicationsComments.mediaUrl,
        createdAt: publicationsComments.createdAt,
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
      .from(publicationsComments)
      .leftJoin(users, eq(publicationsComments.userId, users.id))
      .leftJoin(
        reactionCountSubquery,
        eq(publicationsComments.id, reactionCountSubquery.commentId),
      )
      .leftJoin(
        publicationsReactions,
        and(
          eq(publicationsComments.id, publicationsReactions.reactionableId),
          eq(publicationsReactions.reactionableType, 'comment'),
          eq(publicationsReactions.userId, currentUserId || ''),
        ),
      )
      .where(eq(publicationsComments.publicationId, publicationId))
      .groupBy(
        publicationsComments.id,
        users.id,
        reactionCountSubquery.likeCount,
        reactionCountSubquery.dislikeCount,
        publicationsReactions.reactionType,
        publicationsReactions.userId,
      )
      .orderBy(desc(publicationsComments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deleteComment(id: string, userId: string) {
    return this.drizzleService.db
      .delete(publicationsComments)
      .where(
        and(
          eq(publicationsComments.id, id),
          eq(publicationsComments.userId, userId),
        ),
      );
  }

  async getPostById(postId: string) {
    return this.drizzleService.db.query.posts.findFirst({
      columns: {
        id: true,
        mainTopicId: true,
        content: true,
        createdAt: true,
      },
      where: eq(posts.id, postId),
    });
  }

  async getForumPublicationById(publicationId: string) {
    return this.drizzleService.db.query.forumPublications.findFirst({
      columns: {
        id: true,
        mainTopicId: true,
        content: true,
        createdAt: true,
      },
      where: eq(forumPublications.id, publicationId),
    });
  }

  async getEventById(eventId: string) {
    return await this.drizzleService.db.query.events.findFirst({
      where: eq(events.id, eventId),
      columns: {
        id: true,
        topicId: true,
      },
    });
  }
}
