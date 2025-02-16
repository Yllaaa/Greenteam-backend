import { Injectable } from '@nestjs/common';
import { SQL, and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { publicationsComments } from 'src/modules/db/schemas/schema';
@Injectable()
export class CommentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createComment(
    createCommentDto: {
      content: string;
      userId: string;
      publicationId: string;
    },
    publicationType: SQL<'forum_publication' | 'post' | 'comment'>,
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
    publicationType: SQL<'forum_publication' | 'post' | 'comment'>,
  ) {
    const comment =
      await this.drizzleService.db.query.publicationsComments.findFirst({
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
        },
      });

    return comment;
  }

  async getCommentsByPublicationId(
    publicationId: string,
    pagination: { limit: number; page: number },
  ) {
    const { limit = 10, page = 0 } = pagination || {};
    const offset = Math.max(0, (page - 1) * limit);
    return await this.drizzleService.db.query.publicationsComments.findMany({
      where: eq(publicationsComments.publicationId, publicationId),
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
