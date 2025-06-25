import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { InteractionType } from 'src/modules/db/schemas/schema';
import { UsersService } from 'src/modules/users/users.service';
import { FirebaseService } from 'src/modules/utils/firebase/firebase.service';

@Processor('notificationsQueue')
export class NotificationQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  handleFailedJob(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed: ${err.message}`,
      err.stack,
    );
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);
    try {
      switch (job.name) {
        case 'createNotification':
          return await this.handleCreateNotification(job.data);
        case 'createBatchNotifications':
          return await this.handleBatchNotifications(job.data);
        default:
          const errorMsg = `Unknown job name: ${job.name}`;
          this.logger.warn(errorMsg);
          throw new Error(errorMsg);
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id} (${job.name}):`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleCreateNotification(data: {
    recipientId: string;
    actorId: string;
    type: InteractionType;
    metadata: Record<string, any>;
    messageEn: string;
    messageEs: string;
    userLang?: string;
  }) {
    const { recipientId, actorId, type, metadata, userLang } = data;
    this.logger.log(
      `Creating notification for user ${recipientId} about action by ${actorId}`,
    );

    const result = await this.notificationsService.createNotification(data);

    await this.sendPushNotification(
      recipientId,
      actorId,
      type,
      metadata,
      userLang,
    );
    this.logger.log(`Successfully created notification ${result[0].id}`);
    return result;
  }

  private async handleBatchNotifications(data: {
    recipientIds: string[];
    actorId: string;
    type: InteractionType;
    metadata: Record<string, any>;
    messageEn: string;
    messageEs: string;
    userLangMap?: Record<string, string>;
  }) {
    const {
      recipientIds,
      actorId,
      type,
      metadata,
      messageEn,
      messageEs,
      userLangMap = {},
    } = data;
    this.logger.log(
      `Creating batch notifications for ${recipientIds.length} users about action by ${actorId}`,
    );

    const results = await Promise.all(
      recipientIds.map(async (recipientId) => {
        const userLang = userLangMap[recipientId] || 'en';

        return this.notificationsService.createNotification({
          recipientId,
          actorId,
          type,
          metadata,
          messageEn,
          messageEs,
          userLang,
        });
      }),
    );

    this.logger.log(
      `Successfully created ${results.length} batch notifications`,
    );
    return results;
  }

  private async sendPushNotification(
    recipientId: string,
    actorId: string,
    type: InteractionType,
    metadata: Record<string, any>,
    userLang: string = 'en',
  ): Promise<void> {
    try {
      const user = await this.usersService.getUserById(recipientId);
      const userFcmToken = user?.fcmToken;
      if (!userFcmToken) {
        this.logger.warn(
          `User ${recipientId} does not have a valid FCM token.`,
        );
        return;
      }

      const actor = await this.usersService.getUserById(actorId);
      const actorName = actor?.fullName || 'Someone';

      const { title, body } =
        this.firebaseService.generatePushNotificationContent(
          type,
          actorName,
          metadata,
          userLang,
        );

      const notificationData = {
        type,
        actorId,
        ...Object.fromEntries(
          Object.entries(metadata).map(([key, value]) => [key, String(value)]),
        ),
      };

      // Send the push notification
      await this.firebaseService.sendPushNotification(
        userFcmToken,
        title,
        body,
        notificationData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${recipientId}:`,
        error,
      );
    }
  }
}
