import { BadRequestException, Injectable } from '@nestjs/common';
import { FollowersRepository } from './followers.repository';
import { UsersService } from '../users.service';
import { getNotificationMessage } from 'src/modules/notifications/notification-messages';
import { NotificationQueueService } from 'src/modules/common/queues/notification-queue/notification-queue.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class FollowersService {
  constructor(
    private readonly followersRepository: FollowersRepository,
    private readonly usersService: UsersService,
    private readonly notificationQueueService: NotificationQueueService,
    private readonly i18n: I18nService, 
  ) {}

  async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('users.followers.errors.FOLLOW_THEMSELVES');
    }

    const isFollowing = await this.followersRepository.isFollowing(
      followerId,
      followingId,
    );

    if (isFollowing) {
      await this.followersRepository.unfollow(followerId, followingId);
      return { following: false };
    } else {
      await this.followersRepository.follow(followerId, followingId);

      await this.sendFollowNotification(followerId, followingId);

      return { following: true };
    }
  }

  private async sendFollowNotification(
    followerId: string,
    followingId: string,
  ): Promise<void> {
    try {
      const followerInfo = await this.getUserInfo(followerId);
      const followerName = followerInfo?.fullName || 'Someone';

      const notificationMessages = getNotificationMessage(
        'followed_user',
        followerName,
      );

      await this.notificationQueueService.addCreateNotificationJob({
        recipientId: followingId,
        actorId: followerId,
        type: 'followed_user',
        metadata: {
          followerUsername: followerInfo?.username,
        },
        messageEn: notificationMessages.en,
        messageEs: notificationMessages.es,
      });
    } catch (error) {
      console.error(this.i18n.translate('users.followers.errors.FAILED_TO_SEND_FOLLOW_NOTIFICATIONS', {
        args: { error: error },
      }));
    }
  }

  private async getUserInfo(userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
  }
}
