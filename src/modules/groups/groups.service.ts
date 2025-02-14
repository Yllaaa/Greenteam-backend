import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { InsertGroupDto, UpdateGroupDto } from './dtos/groups.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async createGroup(data: InsertGroupDto) {
    // TODO: should check for topic exist and user exist 
    
    // const owner = await this.UsersRepository.findById(data.ownerId);
    // if (!owner) {
    //   throw new NotFoundException(`User with ID ${data.ownerId} not found`);
    // }
  
    // const topic = await this.topicsRepository.findById(data.topicId);
    // if (!topic) {
    //   throw new NotFoundException(`Topic with ID ${data.topicId} not found`);
    // }
  
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

  async updateGroupById(groupId: string, data: UpdateGroupDto) {
    const updateGroup = await this.groupsRepository.updateGroup(groupId, data);
    if (!updateGroup.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }
    return updateGroup[0];
  }

  async deleteGroup(groupId: string) {
    const deletedGroup = await this.groupsRepository.deleteGroup(groupId);
    if (!deletedGroup.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }
    return { message: 'Group deleted successfully' };
  }
}
