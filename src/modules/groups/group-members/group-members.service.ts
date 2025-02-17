import { Injectable } from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';

@Injectable()
export class GroupMembersService {
  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
  ) {}

  async joinGroup(userId: string, groupId: string) {
    return this.groupMembersRepository.userJoinGroup(userId, groupId);
  }

  async leaveGroup(userId: string, groupId: string) {
    return this.groupMembersRepository.userLeaveGroup(userId, groupId);
  }

  async getGroupMembers(groupId: string) {
    return this.groupMembersRepository.getGroupMembers(groupId);
  }

  async isGroupMember(userId: string, groupId: string) {
    return this.groupMembersRepository.isGroupMember(userId, groupId);
  }
}