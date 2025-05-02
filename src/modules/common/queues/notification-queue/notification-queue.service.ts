import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InteractionType } from 'src/modules/db/schemas/schema';

interface NotificationData {
  recipientId: string;
  actorId: string;
  type: InteractionType;
  metadata: Record<string, any>;
  messageEn: string;
  messageEs: string;
}

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notificationsQueue') private notificationsQueue: Queue,
  ) {}

  async addCreateNotificationJob(data: NotificationData) {
    await this.notificationsQueue.add('createNotification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  /**
   * Add a job to create a batch of notifications (for group notifications)
   * @param recipientIds The IDs of users to notify
   * @param data The notification data
   */
  async addBatchNotificationJob(
    recipientIds: string[],
    data: Omit<NotificationData, 'recipientId'>,
  ) {
    await this.notificationsQueue.add(
      'createBatchNotifications',
      {
        recipientIds,
        ...data,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
