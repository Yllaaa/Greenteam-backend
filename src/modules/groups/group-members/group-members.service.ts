import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';

@Injectable()
export class GroupMembersService {
  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
  ) { }

  async joinGroup(userId: string, groupId: string) {
    try {
      const group = await this.groupMembersRepository.findGroup(groupId);

      if (!group) {
        throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
      }

      const existingMembership = await this.groupMembersRepository.findMembership(userId, groupId);

      if (existingMembership) {
        throw new ConflictException('groups.group-members.validations.MEMBERSHIP_ALREADY_EXIST');
      }

      await this.groupMembersRepository.createMembership(userId, groupId);

      return { message: 'groups.groups.notifications.GROUP_JOINED' };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('groups.group-members.errors.GROUP_FAIL_JOIN');
    }
  }

  async leaveGroup(userId: string, groupId: string) {
    const result = await this.groupMembersRepository.deleteMembership(userId, groupId);

    if (!result) {
      throw new NotFoundException('groups.group-members.errors.GROUP_MEMBERSHIP_NOT_FOUND');
    }

    return { message: 'groups.groups.notifications.GROUP_LEFT' };
  }

  async getGroupMembers(groupId: string) {
    return this.groupMembersRepository.findMembersByGroup(groupId);
  }

  async isGroupMember(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.groupMembersRepository.findMembership(userId, groupId);
    return !!membership;
  }
}