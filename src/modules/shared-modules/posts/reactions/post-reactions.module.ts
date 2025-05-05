import { Module } from '@nestjs/common';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { ReactionsModule } from '../../reactions/reactions.module';
import { ChallengesModule } from 'src/modules/challenges/challenges.module';
import { PostsService } from '../posts/posts.service';
import { PostsRepository } from '../posts/posts.repository';
import { NotificationQueueModule } from 'src/modules/common/queues/notification-queue/notification-queue.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [ReactionsModule, ChallengesModule, NotificationsModule],
  controllers: [ReactionsController],
  providers: [ReactionsService, PostsService, PostsRepository],
})
export class PostReactionsModule {}
