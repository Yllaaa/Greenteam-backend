import { Module } from '@nestjs/common';
import { GroupEventsController } from './group-events.controller';
import { GroupEventsService } from './group-events.service';
import { GroupsRepository } from '../groups/groups.repository';
import { EventsGroupRepository } from './group-events.repository';
import { EventsModule } from 'src/modules/events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [GroupEventsController],
  providers: [GroupEventsService, GroupsRepository, EventsGroupRepository],
})
export class GroupEventsModule {}
