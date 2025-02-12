import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './repositories/posts.repository';
import { CommentsRepository } from './repositories/comments.repository';
import { Post } from './types/post.type';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetPostsDto } from './dto/get-posts.dto';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentRepository: CommentsRepository,
  ) {}
  async createPost(dto: CreatePostDto, userId: string): Promise<Post> {
    const post = await this.postsRepository.createPost(
      dto.content,
      dto.mainTopicId,
      dto.creatorId,
      dto.creatorType,
      userId,
    );
    if (dto.subtopicIds.length > 0) {
      await Promise.all(
        dto.subtopicIds.map(async (topicId) => {
          await this.postsRepository.addSubtopic(post.id, topicId);
        }),
      );
    }
    return (await this.postsRepository.getPostById(post.id)) as unknown as Post;
  }

  async getPosts(topic: GetPostsDto) {
    return await this.postsRepository.getFilteredPosts(
      {
        mainTopicId: topic.mainTopicId,
        subTopicId: topic.subTopicId,
      },
      {
        page: topic.page,
        limit: topic.limit,
      },
    );
  }

  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    if (dto.parentCommentId) {
      const parentComment = await this.commentRepository.findById(
        dto.parentCommentId,
      );
      if (!parentComment || parentComment.publicationId !== postId) {
        throw new BadRequestException('Invalid parent comment');
      }
    }

    const post = await this.postsRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    return this.commentRepository.createComment({
      postId,
      userId,
      content: dto.content,
      parentCommentId: dto.parentCommentId,
    });
  }
}
