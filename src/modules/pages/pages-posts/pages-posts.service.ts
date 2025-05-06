import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetPostsDto } from 'src/modules/shared-modules/posts/posts/dto/get-posts.dto';
import { PostsRepository } from 'src/modules/shared-modules/posts/posts/posts.repository';
import { PostsService } from 'src/modules/shared-modules/posts/posts/posts.service';
import { PagesService } from '../pages/pages.service';
import { SQL } from 'drizzle-orm';
import { CreatorType } from 'src/modules/db/schemas/schema';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { CreatePagePostDto } from './dtos/create-page-post.dto';
@Injectable()
export class PagesPostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsService: PostsService,
    private readonly pagesService: PagesService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  async getPagePosts(dto: GetPostsDto, slug: string, currentUserId?: string) {
    if (dto.mainTopicId && dto.subTopicId) {
      throw new BadRequestException(
        'pages.posts.errors.FILTER_CONFLICT',
      );
    }
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.pages.errors.PAGE_NOT_FOUND');
    }
    const posts = await this.postsRepository.getFilteredPosts(
      {
        mainTopicId: dto.mainTopicId,
        subTopicId: dto.subTopicId,
      },
      {
        limit: dto.limit,
        page: dto.page,
      },
      currentUserId,
      page.id,
    );
    return posts.map((post) => ({
      ...post,
      isAuthor: page.ownerId === currentUserId,
    }));
  }

  async getPostById(postId: string, slug: string, currentUserId: string) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.pages.errors.PAGE_NOT_FOUND');
    }
    const post = await this.postsRepository.getPostInDetails(
      postId,
      currentUserId,
    );
    if (!post) {
      throw new NotFoundException('pages.posts.errors.POST_NOT_FOUND');
    }
    return post;
  }

  async createPost(data: { dto: CreatePagePostDto; files: any }, slug: string) {
    const { dto, files } = data;
    const { content, creatorType, subtopicIds } = dto;

    if (creatorType !== 'page') {
      throw new BadRequestException('pages.posts.errors.INVALID_CREATOR_TYPE');
    }

    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.pages.errors.PAGE_NOT_FOUND');
    }

    const newPost = await this.postsRepository.createPost(
      content,
      page.topicId,
      creatorType,
      page.id,
    );

    if (subtopicIds?.length) {
      await Promise.all(
        subtopicIds.map((topicId) =>
          this.postsRepository.addSubtopic(newPost.id, topicId),
        ),
      );
    }

    if (files && Object.keys(files).length > 0) {
      const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
        files,
        'posts',
      );

      await this.postsService.handlePostMedia(newPost.id, uploadedFiles);
    }

    return newPost;
  }

  async deletePost(postId: string, slug: string, userId: string) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.pages.errors.PAGE_NOT_FOUND');
    }
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException('pages.posts.errors.POST_NOT_FOUND');
    }
    if (page.ownerId !== userId) {
      throw new BadRequestException('pages.posts.errors.NOT_PAGE_OWNER');
    }
    return this.postsRepository.deletePost(postId, page.id);
  }
}
