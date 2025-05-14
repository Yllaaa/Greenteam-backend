import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { GroupMembersService } from '../group-members/group-members.service';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { CommonRepository } from 'src/modules/common/common.repository';
import { CommonService } from 'src/modules/common/common.service';
import { GetAllGroupsDtos } from './dtos/get-groups.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly groupMembersService: GroupMembersService,
    private readonly commonRepository: CommonRepository,
    private readonly commonService: CommonService,
    private readonly i18n: I18nService

  ) { }

  async createGroup(
    data: { dto: CreateGroupDto; banner: any },
    userId: string,
  ) {
    const { dto, banner } = data;
    const existingGroup = await this.groupsRepository.getGroupByName(dto.name);
    if (existingGroup) {
      throw new BadRequestException('groups.groups.errors.GROUP_NAME_TAKEN');
    }

    await this.commonService.validateLocation(dto.countryId, dto.cityId);

    let uploadedImage;
    if (banner && banner.size > 0) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
        banner,
        'group_banners',
      );
    }

    const [newGroup] = await this.groupsRepository.createGroup(
      { dto, bannerUrl: uploadedImage?.location },
      userId,
    );
    await this.groupMembersService.joinGroup(userId, newGroup.id);
    return newGroup;
  }

  async getAllGroups(query: GetAllGroupsDtos, userId?: string) {
    const groups = await this.groupsRepository.getAllGroups(query, userId);
    return groups.map((group) => ({
      ...group,
      isOwner: group.groupOwnerId === userId,
    }));
  }

  async getGroupDetails(groupId: string, userId: string) {
    const group = await this.groupsRepository.getGroupDetails(groupId, userId);
    if (!group) {
      throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
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
      throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'groups.groups.errors.UNAUTHORIZED_GROUP_ACTION',
      );
    }

    let uploadedImage;
    if (banner) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
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

  async getGroupById(groupId: string) {
    return await this.groupsRepository.getGroupById(groupId);
  }

  async deleteGroup(groupId: string, userId: string) {
    const [group] = await this.groupsRepository.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException(
        'groups.groups.errors.UNAUTHORIZED_GROUP_ACTION',
      );
    }

    await this.groupsRepository.deleteGroup(groupId, userId);

    const translatedMessage = await this.i18n.t('groups.groups.notifications.GROUP_DELETED');
    return { message: translatedMessage};
  }
}
