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
import { CreatePostDto } from 'src/modules/shared-modules/posts/posts/dto/create-post.dto';
import { CreatorType } from 'src/modules/db/schemas/schema';
@Injectable()
export class PagesPostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly pagesService: PagesService,
  ) {}

  async getPagePosts(dto: GetPostsDto, slug: string, currentUserId?: string) {
    if (dto.mainTopicId && dto.subTopicId) {
      throw new BadRequestException(
        'You can only filter by main topic or sub topic',
      );
    }
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return await this.postsRepository.getFilteredPosts(
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
  }

  async getPostById(postId: string, slug: string, currentUserId: string) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    const post = await this.postsRepository.getPostInDetails(
      postId,
      currentUserId,
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async createPost(dto: CreatePostDto, slug: string) {
    const { content, mainTopicId, creatorType, subtopicIds } = dto;
    if (dto.creatorType != ('page' as CreatorType)) {
      throw new BadRequestException('Only page can create posts');
    }
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    const newPost = await this.postsRepository.createPost(
      content,
      mainTopicId,
      creatorType,
      page.id,
    );

    if (subtopicIds.length) {
      await Promise.all(
        subtopicIds.map((topicId) =>
          this.postsRepository.addSubtopic(newPost.id, topicId),
        ),
      );
    }

    return newPost;
  }
}
