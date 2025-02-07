import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventsDto } from './dto/events.dto';

@Injectable()
export class EventsService {
    readonly EVENTS_PER_PAGE = 10

    constructor(
        readonly eventRepository: EventsRepository
    ) { }

    private convertDate(date: Date) {
        date.setFullYear(0)
    }

    async createEventFromUser(event: EventsDto, user: any) {
        event.creator_id = user.id;
        event.creator_type = 'User'
        await this.createEvent(event)
    }

    async createEventFromPage(event: EventsDto, page: any) {
        event.creator_id = page.id
        event.creator_type = 'Page'
        await this.createEvent(event)
    }

    private async createEvent(event: EventsDto) {
        this.convertDate(event.start_date)
        this.convertDate(event.end_date)
        await this.eventRepository.createEvent(event)
    }

    async getEvents(page: number) {
        const offset = page * this.EVENTS_PER_PAGE;
        return await this.eventRepository.getEvents(offset, this.EVENTS_PER_PAGE)
    }
}
