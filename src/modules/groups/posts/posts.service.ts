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
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class GroupPostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsService: PostsService,
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMemberRepository: GroupMembersRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly i18n: I18nService,
  ) { }

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
      throw new NotFoundException(this.i18n.translate('groups.groups.errors.GROUP_ID_NOT_FOUND', {
        args: { groupId }
      }));
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
        'groups.posts.errors.FILTER_WITH_MAIN_AND_SUB_TOPIC',
      );
    }

    const group = await this.groupsRepository.getGroupById(groupId);
    if (!group || !group.length) {
      throw new NotFoundException(this.i18n.translate('groups.groups.errors.GROUP_ID_NOT_FOUND', {
        args: { groupId }
      }));
    }
    const groupOwner = group[0].ownerId;
    const posts = await this.postsRepository.getFilteredPosts(
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
    return posts.map((post) => {
      return {
        ...post,
        isAuthor: post.author.id === userId || post.author.id === groupOwner,
      };
    });
  }

  async getPostInDetails(postId: string, userId: string) {
    const post = await this.postsRepository.getPostInDetails(postId, userId);
    if (!post || !post.length) {
      throw new NotFoundException('groups.posts.errors.POST_NOT_FOUND');
    }
    return post;
  }

  async deletePost(postId: string, userId: string, groupId: string) {
    const [group] = await this.groupsRepository.getGroupById(groupId);
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException('groups.posts.errors.POST_NOT_FOUND');
    }
    if (post.creatorId !== userId && group.ownerId !== userId) {
      throw new ForbiddenException('groups.posts.errors.UNAUTHORIZED_POST_DELETION');
    }

    await this.postsRepository.deletePost(postId, post.creatorId);
    return {
      message: 'groups.posts.notifications.POST_DELETED',
    };
  }
}
