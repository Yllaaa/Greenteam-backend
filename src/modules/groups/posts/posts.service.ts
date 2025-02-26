import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../shared-modules/posts/posts/posts.repository';
import { Post } from '../../shared-modules/posts/posts/types/post.type';
import { CreatePostDto } from '../../shared-modules/posts/posts/dto/create-post.dto';
import { GroupsRepository } from '../groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';

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
}
