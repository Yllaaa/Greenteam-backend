import { Module } from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { NotificationQueueModule } from 'src/modules/common/queues/notification-queue/notification-queue.module';

@Module({
  imports: [],
  controllers: [GroupMembersController],
  providers: [GroupMembersService, GroupMembersRepository],
  exports: [GroupMembersService, GroupMembersRepository],
})
export class GroupMembersModule {}
