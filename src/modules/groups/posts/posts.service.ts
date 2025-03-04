import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PostsRepository } from '../../shared-modules/posts/posts/posts.repository';
import { Post } from '../../shared-modules/posts/posts/types/post.type';
import { CreatePostDto } from '../../shared-modules/posts/posts/dto/create-post.dto';
import { GroupsRepository } from '../groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { GetPostsDto } from '../../shared-modules/posts/posts/dto/get-posts.dto';

@Injectable()
export class GroupPostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly groupsRepository: GroupsRepository,
        private readonly groupMemberRepository: GroupMembersRepository
    ) { }

    async createPost(dto: CreatePostDto, groupId: string, groupMemberId: string): Promise<Post> {

        const group = await this.groupsRepository.getGroupById(groupId);

        if (!group || !group.length) {
            throw new NotFoundException(`Group with ID ${groupId} not found.`);
        }

        const groupMember = await this.groupMemberRepository.isGroupMember(groupMemberId, groupId)

        if (!groupMember) {
            throw new NotFoundException(`Group Member with ID ${groupMemberId} not found.`);
        }

        if (String(dto.creatorType) != "group_member") {
            throw new NotFoundException(`can not create post of ${dto.creatorType} type`);
        }

        const post = await this.postsRepository.createPost(
            dto.content,
            dto.mainTopicId,
            groupMemberId,
            dto.creatorType,
            groupMemberId,
            groupId,
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

    async getGroupPosts(groupId: string, userId: string, topic: GetPostsDto) {

        if (topic.mainTopicId && topic.subTopicId) {
            throw new BadRequestException(
                'You can only filter by main topic or sub topic',
            );
        }

        const group = await this.groupsRepository.getGroupById(groupId);
        if (!group || !group.length) {
            throw new NotFoundException(`Group with ID ${groupId} not found.`);
        }

        if (group[0].privacy === 'PRIVATE') {
            const isMember = await this.groupMemberRepository.isGroupMember(userId, groupId);
            if (!isMember) {
                throw new ForbiddenException('You must be a member to view posts in this private group.');
            }
        }

        return this.postsRepository.getFilteredPosts(
            {
                mainTopicId: topic.mainTopicId,
                subTopicId: topic.subTopicId,
                groupId: groupId
            },
            {
                page: topic.page,
                limit: topic.limit,
            },
            userId,
        );

    }
}