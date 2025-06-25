import { Module } from '@nestjs/common';
import { CommentsRepository } from './repositories/comments.repository';
import { RepliesRepository } from './repositories/replies.repository';
import { CommentsService } from './comments.service';
import { NotificationQueueModule } from 'src/modules/common/queues/notification-queue/notification-queue.module';

@Module({
  imports: [],
  providers: [CommentsRepository, RepliesRepository, CommentsService],
  controllers: [],
  exports: [CommentsService, RepliesRepository],
})
export class CommentsModule {}
