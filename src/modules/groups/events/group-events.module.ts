import { Module } from '@nestjs/common';
import { GroupEventsController } from './group-events.controller';
import { GroupEventsService } from './group-events.service';
import { EventsRepository } from '../../events/events/events.repository';
import { GroupsRepository } from '../groups.repository';
import { EventsGroupRepository } from './group-events.repository';

@Module({
  controllers: [GroupEventsController],
  providers: [
    GroupEventsService,
    EventsRepository,
    GroupsRepository,
    EventsGroupRepository,
  ],
})
export class GroupEventsModule {}
