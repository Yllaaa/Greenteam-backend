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
    }),
  ],
  controllers: [],
  providers: [QueuesService, PointsQueueProcessor],
  exports: [QueuesService, PointsQueueProcessor],
})
export class BullMQModule {}
