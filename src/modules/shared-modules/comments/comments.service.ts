import { Injectable, NotFoundException } from '@nestjs/common';
import { SQL } from 'drizzle-orm';
import { CreateCommentDto } from 'src/modules/shared-modules/comments/dtos/create-comment.dto';
import { CommentsRepository } from 'src/modules/shared-modules/comments/repositories/comments.repository';
import { RepliesRepository } from 'src/modules/shared-modules/comments/repositories/replies.repository';
@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly repliesRepository: RepliesRepository,
  ) {}

  async createComment(
    publicationId: string,
    userId: string,
    commentDto: {
      content: string;
      publicationType: SQL<'forum_publication' | 'post' | 'comment'>;
    },
  ) {
    const newComment = await this.commentsRepository.createComment(
      { userId, content: commentDto.content, publicationId },
      commentDto.publicationType,
    );
    const comment = await this.commentsRepository.findById(
      newComment.id,
      commentDto.publicationType,
    );
    return comment;
  }

  async getCommentsByPublicationId(
    publicationId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.commentsRepository.getCommentsByPublicationId(
      publicationId,
      pagination,
    );
  }

  async createCommentReply(commentId: string, userId: string, dto: any) {
    const comment = await this.commentsRepository.findById(
      commentId,
      dto.publicationType,
    );
    if (!comment) throw new NotFoundException('Comment not found');

    const newReply = await this.repliesRepository.createCommentReply({
      commentId,
      userId,
      content: dto.content,
    });
    const reply = await this.repliesRepository.findById(newReply.id);
    return reply;
  }

  async getCommentsByPostId(
    postId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.commentsRepository.getCommentsByPublicationId(
      postId,
      pagination,
    );
  }

  async getRepliesByCommentId(
    commentId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.repliesRepository.getRepliesByCommentId(commentId, pagination);
  }
}
