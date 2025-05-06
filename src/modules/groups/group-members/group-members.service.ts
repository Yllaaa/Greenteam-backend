import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';
import { getNotificationMessage } from 'src/modules/notifications/notification-messages';
import { UsersService } from 'src/modules/users/users.service';
import { NotificationQueueService } from 'src/modules/common/queues/notification-queue/notification-queue.service';

@Injectable()
export class GroupMembersService {
  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly usersService: UsersService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async joinGroup(userId: string, groupId: string) {
    try {
      const group = await this.groupMembersRepository.findGroup(groupId);
      if (!group) {
        throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
      }

      const existingMembership =
        await this.groupMembersRepository.findMembership(userId, groupId);
      if (existingMembership) {
        throw new ConflictException('groups.group-members.validations.MEMBERSHIP_ALREADY_EXIST');
      }

      await this.groupMembersRepository.createMembership(userId, groupId);

      if (group.ownerId !== userId) {
        await this.sendGroupJoinNotification(
          userId,
          group.ownerId,
          groupId,
          group.name,
        );
      }

      return { message: 'groups.groups.notifications.GROUP_JOINED' };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error('groups.group-members.errors.GROUP_FAIL_JOIN');
    }
  }

  async leaveGroup(userId: string, groupId: string) {
    const result = await this.groupMembersRepository.deleteMembership(
      userId,
      groupId,
    );

    if (!result) {
      throw new NotFoundException('groups.group-members.errors.GROUP_MEMBERSHIP_NOT_FOUND');
    }

    return { message: 'groups.groups.notifications.GROUP_LEFT' };
  }

  async getGroupMembers(groupId: string) {
    return this.groupMembersRepository.findMembersByGroup(groupId);
  }

  async isGroupMember(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.groupMembersRepository.findMembership(
      userId,
      groupId,
    );
    return !!membership;
  }

  private async getUserInfo(userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
  }

  private async sendGroupJoinNotification(
    joinerId: string,
    adminId: string,
    groupId: string,
    groupName: string,
  ): Promise<void> {
    try {
      const joinerInfo = await this.getUserInfo(joinerId);
      const joinerName = joinerInfo?.fullName || 'Someone';

      const notificationMessages = getNotificationMessage(
        'joined_group',
        joinerName,
        { groupName },
      );

      await this.notificationQueueService.addCreateNotificationJob({
        recipientId: adminId,
        actorId: joinerId,
        type: 'joined_group',
        metadata: {
          joinerId: joinerId,
          groupId: groupId,
          groupName: groupName,
        },
        messageEn: notificationMessages.en,
        messageEs: notificationMessages.es,
      });
    } catch (error) {
      console.error('Failed to send group join notification:', error);
    }
  }
}
