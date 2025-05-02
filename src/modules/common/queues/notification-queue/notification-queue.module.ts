import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationQueueProcessor } from './notification-queue.processor';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notificationsQueue',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    NotificationsModule,
  ],
  providers: [NotificationQueueService, NotificationQueueProcessor],
  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}
