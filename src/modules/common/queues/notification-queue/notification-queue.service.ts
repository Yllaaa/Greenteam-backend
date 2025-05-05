import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InteractionType } from 'src/modules/db/schemas/schema';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notificationsQueue') private notificationsQueue: Queue,
  ) {}

  async addCreateNotificationJob(data: {
    recipientId: string;
    actorId: string;
    type: InteractionType;
    metadata: Record<string, any>;
    messageEn: string;
    messageEs: string;
    userLang?: string;
  }) {
    return this.notificationsQueue.add('createNotification', data);
  }

  async addBatchNotificationsJob(data: {
    recipientIds: string[];
    actorId: string;
    type: InteractionType;
    metadata: Record<string, any>;
    messageEn: string;
    messageEs: string;
    userLangMap?: Record<string, string>;
  }) {
    return this.notificationsQueue.add('createBatchNotifications', data);
  }
}
