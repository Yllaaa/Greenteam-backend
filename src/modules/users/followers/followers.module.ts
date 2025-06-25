import { Module, forwardRef } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersRepository } from './followers.repository';
import { NotificationQueueModule } from 'src/modules/common/queues/notification-queue/notification-queue.module';

@Module({
  imports: [forwardRef(() => NotificationQueueModule)],
  controllers: [],
  providers: [FollowersService, FollowersRepository],
  exports: [FollowersService, FollowersRepository],
})
export class FollowersModule {}
