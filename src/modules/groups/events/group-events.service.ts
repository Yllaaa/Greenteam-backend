import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventsRepository } from '../../events/events/events.repository';
import { GroupsRepository } from '../groups/groups.repository';
import { CreateEventDto } from '../../events/events/dto/createEvents.dto';
import { EventsGroupRepository } from './group-events.repository';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { EventsService } from 'src/modules/events/events/events.service';
import { CommonService } from 'src/modules/common/common.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class GroupEventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly groupsRepository: GroupsRepository,
    private readonly eventsGroupRepository: EventsGroupRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly commonService: CommonService,
    private readonly i18n: I18nService,
  ) {}

  async createGroupEvent(
    groupId: string,
    userId: string,
    eventData: { data: CreateEventDto; poster: Express.Multer.File },
  ) {
    const { data, poster } = eventData;
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException('groups.groups.errors.GROUP_NOT_FOUND');
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'groups.events.errors.ONLY_OWNER_CREATE_EVENT',
      );
    }
    await this.commonService.validateLocation(data.countryId, data.cityId);
    let uploadedImage;
    if (poster) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
        poster,
        'event_poster',
      );
    }

    const event = {
      ...data,
      groupId: groupId,
    };

    return this.eventsRepository.createEvent(
      { dto: event, posterUrl: uploadedImage?.location || null },
      userId,
    );
  }

  async getGroupEvents(
    groupId: string,
    pagination: { page: number; limit: number },
    userId?: string,
  ) {
    const { page, limit } = pagination;
    const group = await this.groupsRepository.getGroupById(groupId);
    const groupOwner = group[0].ownerId;
    if (!group || !group.length) {
      throw new NotFoundException(
        this.i18n.translate('groups.groups.errors.GROUP_ID_NOT_FOUND', {
          args: { groupId },
        }),
      );
    }

    const events = await this.eventsGroupRepository.getGroupEvents(groupId, {
      page,
      limit,
    });
    return events.map((event) => ({
      ...event,
      isAuthor: groupOwner === userId,
    }));
  }

  async getGroupEventDetails(groupId: string, eventId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(
        this.i18n.translate('groups.groups.errors.GROUP_ID_NOT_FOUND', {
          args: { groupId },
        }),
      );
    }

    const event = await this.eventsRepository.getEventDetails(
      eventId,
      userId,
      groupId,
    );

    if (!event) {
      throw new NotFoundException('groups.events.errors.EVENT_NOT_FOUND');
    }

    return event;
  }

  async deleteGroupEvent(groupId: string, eventId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(
        this.i18n.translate('groups.groups.errors.GROUP_ID_NOT_FOUND', {
          args: { groupId },
        }),
      );
    }

    const event = await this.eventsRepository.getEventDetails(
      eventId,
      userId,
      groupId,
    );

    if (!event) {
      throw new NotFoundException('groups.events.errors.EVENT_NOT_FOUND');
    }
    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'groups.events.errors.UNAUTHORIZED_EVENT_ACTION',
      );
    }

    return this.eventsGroupRepository.deleteGroupEvent(eventId, groupId);
  }
}
