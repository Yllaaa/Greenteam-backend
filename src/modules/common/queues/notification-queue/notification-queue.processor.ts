import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsRepository } from 'src/modules/notifications/notifications.repository';
import { InteractionType } from 'src/modules/db/schemas/schema';

@Processor('notificationsQueue')
export class NotificationQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(
    private readonly notificationRepository: NotificationsRepository,
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
  }) {
    const { recipientId, actorId, type, metadata, messageEn, messageEs } = data;

    this.logger.log(
      `Creating notification for user ${recipientId} about action by ${actorId}`,
    );

    const result = await this.notificationRepository.createNotification(
      recipientId,
      actorId,
      type,
      metadata,
      messageEn,
      messageEs,
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
  }) {
    const { recipientIds, actorId, type, metadata, messageEn, messageEs } =
      data;

    this.logger.log(
      `Creating batch notifications for ${recipientIds.length} users about action by ${actorId}`,
    );

    // Create notifications in parallel
    const results = await Promise.all(
      recipientIds.map((recipientId) =>
        this.notificationRepository.createNotification(
          recipientId,
          actorId,
          type,
          metadata,
          messageEn,
          messageEs,
        ),
      ),
    );

    this.logger.log(
      `Successfully created ${results.length} batch notifications`,
    );
    return results;
  }
}
