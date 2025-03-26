import {
  Controller,
  Get,
  Query,
  Param,
  Req,
  HttpCode,
  HttpException,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PagesEventsService } from './pages-events.service';
import { CreateEventDto } from 'src/modules/events/events/dto/events.dto';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class PagesEventsController {
  constructor(private readonly pagesEventsService: PagesEventsService) {}

  @Post('create-event')
  async createEvent(
    @Body() eventDto: CreateEventDto,
    @Req() req,
    @Param('slug') slug: string,
  ) {
    const userId = req.user.id;
    try {
      return await this.pagesEventsService.createEvent(eventDto, slug, userId);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('')
  async getEvents(
    @Query() eventDto: GetEventsDto,
    @Req() req,
    @Param('slug') slug: string,
  ) {
    const userId = req.user.id;

    return await this.pagesEventsService.getEvents(eventDto, slug, userId);
  }

  @Get('/:id')
  async getEventDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.pagesEventsService.getEventDetails(id, userId);
  }
}
