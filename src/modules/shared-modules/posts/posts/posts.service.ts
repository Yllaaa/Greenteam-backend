import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CommentsRepository } from '../comments/repositories/comments.repository';
import { Post } from './types/post.type';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { RepliesRepository } from '../comments/repositories/replies.repository';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly repliesRepository: RepliesRepository,
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
    if (topic.mainTopicId && topic.subTopicId) {
      throw new BadRequestException(
        'You can only filter by main topic or sub topic',
      );
    }
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
}
