import { Body, Controller, Get, NotImplementedException, Param, Post, Request } from '@nestjs/common';
import { EventsDto } from './dto/events.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from './dto/getEvents.dto';

@Controller('events')
export class EventsController {
    constructor(
        readonly eventsService: EventsService
    ) { }

    @Post('user')
    async createEventFromUser(@Body() event: EventsDto, @Request() req) {
        this.eventsService.createEventFromUser(event, req.user)
    }

    @Post('page')
    async createEventFromPage(@Body() event: EventsDto, @Request() req) {
        throw new NotImplementedException();
    }

    @Get(':pageNo?')
    async getEvents(@Param() page: GetEventsDto) {
        page.pageNo = page.pageNo || 0
        return await this.eventsService.getEvents(page.pageNo)
    }
}
