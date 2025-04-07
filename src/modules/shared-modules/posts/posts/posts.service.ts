import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from './types/post.type';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { MediaType } from 'src/modules/db/schemas/posts/enums';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly queuesService: QueuesService,
  ) {}
  async createPost(
    dto: {
      createPostDto: CreatePostDto;
      files: any;
    },
    userId: string,
  ): Promise<Post> {
    const { content, mainTopicId, creatorType, subtopicIds } =
      dto.createPostDto;
    const newPost = await this.postsRepository.createPost(
      content,
      mainTopicId,
      creatorType,
      userId,
    );

    if (subtopicIds.length) {
      await Promise.all(
        subtopicIds.map((topicId) =>
          this.postsRepository.addSubtopic(newPost.id, topicId),
        ),
      );
    }

    const { files } = dto;
    const mediaEntries: {
      parentId: string;
      parentType: 'post';
      mediaUrl: string;
      mediaType: MediaType;
    }[] = [];

    const pushMedia = (file: any, mediaType: MediaType) => {
      console.log(`Pushing media: ${file?.location} as ${mediaType}`);
      mediaEntries.push({
        parentId: newPost.id,
        parentType: 'post',
        mediaUrl: file.location,
        mediaType,
      });
    };

    files?.images?.forEach((file) => pushMedia(file, 'image' as MediaType));
    files?.audio?.forEach((file) => pushMedia(file, 'audio' as MediaType));
    files?.document?.forEach((file) =>
      pushMedia(file, 'document' as MediaType),
    );

    if (mediaEntries.length) {
      console.log('mediaEntries', mediaEntries);
      await this.postsRepository.insertPostMedia(mediaEntries);
    }

    const action: Action = { id: newPost.id, type: 'post' };
    const topicsToAward = subtopicIds.length ? subtopicIds : [mainTopicId];
    await Promise.all(
      topicsToAward.map((topicId) =>
        this.queuesService.addPointsJob(userId, topicId, action),
      ),
    );

    return newPost as Post;
  }

  async getPosts(dto: GetPostsDto, userId: string) {
    if (dto.mainTopicId && dto.subTopicId) {
      throw new BadRequestException(
        'You can only filter by main topic or sub topic',
      );
    }
    return await this.postsRepository.getFilteredPosts(
      {
        mainTopicId: dto.mainTopicId,
        subTopicId: dto.subTopicId,
      },
      {
        page: dto.page,
        limit: dto.limit,
      },
      userId,
    );
  }

  async getPostInDetails(postId: string, userId: string) {
    const [post] = await this.postsRepository.getPostInDetails(postId, userId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getPostById(postId: string) {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
}
