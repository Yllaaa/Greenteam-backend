import { Injectable } from '@nestjs/common';
import { eq, SQL, and } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { publicationsComments } from 'src/modules/db/schemas/posts/comments-likes';

@Injectable()
export class CommentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createComment(createCommentDto: any) {
    const comment = await this.drizzleService.db
      .insert(publicationsComments)
      .values({
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        publicationId: createCommentDto.publicationId,
        publicationType: 'post',
        parentCommentId: createCommentDto.parentCommentId ?? null,
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
}
