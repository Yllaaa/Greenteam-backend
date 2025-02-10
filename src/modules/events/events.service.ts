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
        return await this.createEvent(event)
    }

    async createEventFromPage(event: EventsDto, page: any) {
        event.creator_id = page.id
        event.creator_type = 'Page'
        return await this.createEvent(event)
    }

    private async createEvent(event: EventsDto) {
        this.convertDate(event.start_date)
        this.convertDate(event.end_date)
        return await this.eventRepository.createEvent(event)
    }

    async getEvents(page: number) {
        const offset = page * this.EVENTS_PER_PAGE;
        return await this.eventRepository.getEvents(offset, this.EVENTS_PER_PAGE)
    }

    async getEventsByCategory(page: number, category: string) {
        const offset = page * this.EVENTS_PER_PAGE;
        return await this.eventRepository.getEventsByCategory(offset, this.EVENTS_PER_PAGE, category)
    }

    async getEventDetails(id: string) {
        return await this.eventRepository.getEventDetails(id)
    }

    async eventExist(event_id: string) {
        return (await this.eventRepository.getEvent(event_id)) != undefined
    }

    async AddEventJoined(event_id: string, user: any) {
        return await this.eventRepository.addEventJoin(event_id, user.id)
    }
}
