import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentsRepository } from './repositories/comments.repository';
import { RepliesRepository } from './repositories/replies.repository';
import { PostsRepository } from '../posts/posts.repository';
@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly repliesRepository: RepliesRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postsRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    return this.commentRepository.createComment({
      postId,
      userId,
      content: dto.content,
    });
  }

  async createCommentReply(commentId: string, userId: string, dto: any) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    return this.repliesRepository.createCommentReply({
      commentId,
      userId,
      content: dto.content,
    });
  }

  async getCommentsByPostId(
    postId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.commentRepository.getCommentsByPostId(postId, pagination);
  }

  async getRepliesByCommentId(
    commentId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.repliesRepository.getRepliesByCommentId(commentId, pagination);
  }
}
