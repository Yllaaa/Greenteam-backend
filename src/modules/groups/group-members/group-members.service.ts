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
        throw new NotFoundException('Group not found');
      }

      const existingMembership = await this.groupMembersRepository.findMembership(userId, groupId);

      if (existingMembership) {
        throw new ConflictException('User is already a member of this group');
      }

      await this.groupMembersRepository.createMembership(userId, groupId);

      return { message: 'Successfully joined the group' };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to join group');
    }
  }

  async leaveGroup(userId: string, groupId: string) {
    const result = await this.groupMembersRepository.deleteMembership(userId, groupId);

    if (!result) {
      throw new NotFoundException('Membership not found');
    }

    return { message: 'Successfully left the group' };
  }

  async getGroupMembers(groupId: string) {
    return this.groupMembersRepository.findMembersByGroup(groupId);
  }

  async isGroupMember(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.groupMembersRepository.findMembership(userId, groupId);
    return !!membership;
  }
}