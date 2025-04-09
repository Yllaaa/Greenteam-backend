import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { UploadMediaService } from '../common/upload-media/upload-media.service';
import { GroupMembersService } from './group-members/group-members.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  async createGroup(
    data: { dto: CreateGroupDto; banner: any },
    userId: string,
  ) {
    const { dto, banner } = data;
    let uploadedImage;
    if (banner) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
        banner,
        'group_banners',
      );
    }
    const [newGroup] = await this.groupsRepository.createGroup(
      { dto, bannerUrl: uploadedImage.location },
      userId,
    );
    await this.groupMembersService.joinGroup(userId, newGroup.id);
    return newGroup;
  }

  async getAllGroups(
    pagination: { limit: number; page: number },
    userId: string,
    topicId?: number,
  ) {
    return this.groupsRepository.getAllGroups(pagination, userId, topicId);
  }

  async getGroupDetails(groupId: string, userId: string) {
    const group = await this.groupsRepository.getGroupDetails(groupId, userId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }
    return group;
  }

  async updateGroup(
    groupId: string,
    userId: string,
    data: { dto: UpdateGroupDto; banner: any },
  ) {
    const { dto, banner } = data;
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'Only the group owner can update this group.',
      );
    }

    let uploadedImage;
    if (banner) {
      const uploadedImage = await this.uploadMediaService.uploadSingleImage(
        banner,
        'group_banners',
      );
    }
    const updateData = {
      ...dto,
      ...(uploadedImage && { bannerUrl: uploadedImage.location }),
    };
    const updateGroup = await this.groupsRepository.updateGroup(
      groupId,
      updateData,
    );
    return updateGroup[0];
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'Only the group owner can delete this group.',
      );
    }

    const deletedGroup = await this.groupsRepository.deleteGroup(groupId);
    return { message: 'Group deleted successfully' };
  }
}
