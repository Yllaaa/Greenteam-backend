import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { PointsQueueProcessor } from './queues.processor';
import { BullModule } from '@nestjs/bullmq';
import { NotificationQueueModule } from './notification-queue/notification-queue.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pointsQueue',
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

    NotificationQueueModule,
  ],
  controllers: [],
  providers: [QueuesService, PointsQueueProcessor],
  exports: [QueuesService, PointsQueueProcessor],
})
export class BullMQModule {}
