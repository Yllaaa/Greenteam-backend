import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventsRepository } from '../../events/events.repository';
import { GroupsRepository } from '../groups.repository';
import { EventsDto } from '../../events/dto/events.dto';
import { EventsGroupRepository } from './group-events.repository';

@Injectable()
export class GroupEventsService {
    constructor(
        private readonly eventsRepository: EventsRepository,
        private readonly groupsRepository: GroupsRepository,
        private readonly eventsGroupRepository: EventsGroupRepository,
    ) { }

    async createGroupEvent(groupId: string, userId: string, eventData: EventsDto) {

        const group = await this.groupsRepository.getGroupById(groupId);

        if (!group || !group.length) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }

        if (group[0].ownerId !== userId) {
            throw new ForbiddenException('Only group owners can create events for this group');
        }

        const event = {
            ...eventData,
            creatorId: userId,
            groupId: groupId,
        };

        return this.eventsRepository.createEvent(event);
    }

    async getGroupEvents(groupId: string, category, page: number = 1, limit: number = 10) {
        const group = await this.groupsRepository.getGroupById(groupId);

        if (!group || !group.length) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }

        return this.eventsGroupRepository.getGroupEvents(groupId, category, page, limit);
    }

    async getGroupEventDetails(groupId: string, eventId: string) {
        const group = await this.groupsRepository.getGroupById(groupId);

        if (!group || !group.length) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }

        const event = await this.eventsRepository.getEventDetails(eventId);

        if (!event) {
            throw new NotFoundException(`Event with ID ${eventId} not found`);
        }

        if (event.groupId !== groupId) {
            throw new NotFoundException(`Event does not belong to this group`);
        }

        return event;
    }

    async joinGroupEvent(groupId: string, eventId: string, userId: string) {
        await this.getGroupEventDetails(groupId, eventId);
        return this.eventsRepository.addUserJoinedEvent(eventId, userId);
    }
}