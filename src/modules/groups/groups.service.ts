import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { InsertGroupDto, UpdateGroupDto } from './dtos/groups.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) { }

  async createGroup(data: InsertGroupDto) {
    return this.groupsRepository.createGroup(data);
  }

  async getAllGroups(pagination: { limit: number; page: number }) {
    return this.groupsRepository.getAllGroups(pagination);
  }

  async getGroupById(groupId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);
    if (!group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }
    return group[0];
  }

  async updateGroupById(groupId: string, userId: string, data: UpdateGroupDto) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can update this group.');
    }

    const updateGroup = await this.groupsRepository.updateGroup(groupId, data);
    return updateGroup[0];
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException('Only the group owner can delete this group.');
    }

    const deletedGroup = await this.groupsRepository.deleteGroup(groupId);
    return { message: 'Group deleted successfully' };
  }
}
