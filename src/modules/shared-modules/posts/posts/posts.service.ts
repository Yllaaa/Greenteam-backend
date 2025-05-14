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
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly queuesService: QueuesService,
    private readonly uploadMediaService: UploadMediaService,
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
    if (files && Object.keys(files).length > 0) {
      const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
        files,
        'posts',
      );
      await this.handlePostMedia(newPost.id, uploadedFiles);
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
        'pages.posts.errors.FILTER_CONFLICT',
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
      throw new NotFoundException('pages.posts.errors.POST_NOT_FOUND');
    }
    return post;
  }

  async getPostById(postId: string) {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException('pages.posts.errors.POST_NOT_FOUND');
    }
    return post;
  }

  async handlePostMedia(postId: string, files: any): Promise<void> {
    const mediaEntries: {
      parentId: string;
      parentType: 'post';
      mediaUrl: string;
      mediaType: MediaType;
    }[] = [];

    const pushMedia = (file: any, mediaType: MediaType) => {
      mediaEntries.push({
        parentId: postId,
        parentType: 'post',
        mediaUrl: file.location,
        mediaType,
      });
    };

    files?.images?.forEach((file) => pushMedia(file, 'image'));
    files?.audio?.forEach((file) => pushMedia(file, 'audio'));
    files?.document?.forEach((file) => pushMedia(file, 'document'));

    if (mediaEntries.length) {
      await this.postsRepository.insertPostMedia(mediaEntries);
    }
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new NotFoundException('pages.posts.errors.POST_NOT_FOUND');
    }

    if (post.creatorId !== userId) {
      throw new BadRequestException('pages.posts.errors.DELETE_POST_AUTHORIZATION_DENIAL');
    }
    await this.postsRepository.deletePost(postId, userId);
  }
}
