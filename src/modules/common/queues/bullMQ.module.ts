import { Module } from '@nestjs/common';
import { MailJobModule } from './mails/mail-job.module';
import { QueuesService } from './queues.service';
import { PointsQueueProcessor } from './queues.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    MailJobModule,

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
  ],
  controllers: [],
  providers: [QueuesService, PointsQueueProcessor],
  exports: [QueuesService, PointsQueueProcessor],
})
export class BullMQModule {}
