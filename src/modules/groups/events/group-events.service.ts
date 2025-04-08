import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventsRepository } from '../../events/events/events.repository';
import { GroupsRepository } from '../groups.repository';
import { CreateEventDto } from '../../events/events/dto/events.dto';
import { EventsGroupRepository } from './group-events.repository';

@Injectable()
export class GroupEventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly groupsRepository: GroupsRepository,
    private readonly eventsGroupRepository: EventsGroupRepository,
  ) {}

  async createGroupEvent(
    groupId: string,
    userId: string,
    eventData: CreateEventDto,
  ) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'Only group owners can create events for this group',
      );
    }

    const event = {
      ...eventData,

      groupId: groupId,
    };

    return this.eventsRepository.createEvent(
      { dto: event, posterUrl: 'null' },
      userId,
    );
  }

  async getGroupEvents(
    groupId: string,
    category,
    page: number = 1,
    limit: number = 10,
  ) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.eventsGroupRepository.getGroupEvents(
      groupId,
      category,
      page,
      limit,
    );
  }

  async getGroupEventDetails(groupId: string, eventId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const event = await this.eventsRepository.getEventDetails(eventId, userId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  async joinGroupEvent(groupId: string, eventId: string, userId: string) {
    await this.getGroupEventDetails(groupId, eventId, userId);
    return this.eventsRepository.addUserJoinedEvent(eventId, userId);
  }
}
