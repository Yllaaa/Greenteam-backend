import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PostsRepository } from '../../shared-modules/posts/posts/posts.repository';
import { Post } from '../../shared-modules/posts/posts/types/post.type';
import { GroupsRepository } from '../groups/groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { GetPostsDto } from '../../shared-modules/posts/posts/dto/get-posts.dto';
import { CreateGroupPostDto } from './dtos/create-post.dto';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { PostsService } from 'src/modules/shared-modules/posts/posts/posts.service';

@Injectable()
export class GroupPostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsService: PostsService,
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMemberRepository: GroupMembersRepository,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  async createPost(
    data: {
      dto: CreateGroupPostDto;
      files: {
        images?: Express.Multer.File[];
        document?: Express.Multer.File[];
      };
    },
    groupId: string,
    userId: string,
  ): Promise<Post> {
    const { dto, files } = data;
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    const newPost = await this.postsRepository.createPost(
      dto.content,
      dto.mainTopicId,
      'group_member',
      userId,
      groupId,
    );

    if (dto.subtopicIds && dto.subtopicIds.length > 0) {
      await Promise.all(
        dto.subtopicIds.map(async (topicId) => {
          await this.postsRepository.addSubtopic(newPost.id, topicId);
        }),
      );
    }
    if (files && Object.keys(files).length > 0) {
      const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
        files,
        'posts',
      );
      await this.postsService.handlePostMedia(newPost.id, uploadedFiles);
    }
    return (await this.postsRepository.getPostById(
      newPost.id,
    )) as unknown as Post;
  }

  async getGroupPosts(groupId: string, userId: string, filter: GetPostsDto) {
    if (filter.mainTopicId && filter.subTopicId) {
      throw new BadRequestException(
        'You can only filter by main topic or sub topic',
      );
    }

    const group = await this.groupsRepository.getGroupById(groupId);
    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    return this.postsRepository.getFilteredPosts(
      {
        mainTopicId: filter.mainTopicId,
        subTopicId: filter.subTopicId,
        groupId: groupId,
      },
      {
        page: filter.page,
        limit: filter.limit,
      },
      userId,
    );
  }

  async getPostInDetails(postId: string, userId: string) {
    const post = await this.postsRepository.getPostInDetails(postId, userId);
    if (!post || !post.length) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async deletePost(postId: string, userId: string, groupId: string) {
    const [group] = await this.groupsRepository.getGroupById(groupId);
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.creatorId !== userId && group.ownerId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.postsRepository.deletePost(postId, post.creatorId);
    return {
      message: 'Post deleted successfully',
    };
  }
}
