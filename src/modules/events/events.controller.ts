import { Body, Controller, Get, NotImplementedException, Param, Post, Query, Request } from '@nestjs/common';
import { EventsDto } from './dto/events.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from './dto/getEvents.dto';
import { IdParamDto } from './dto/id-param.dto';

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

    @Get('')
    async getEvents(@Query() page: GetEventsDto) {
        page.pageNo = page.pageNo || 0
        if (page.category) {
            return await this.eventsService.getEventsByCategory(page.pageNo, page.category)
        }
        return await this.eventsService.getEvents(page.pageNo)
    }

    @Get(':id')
    async getEventDetail(@Param() idDto: IdParamDto) {
        return await this.eventsService.getEventDetails(idDto.id)
    }
}
