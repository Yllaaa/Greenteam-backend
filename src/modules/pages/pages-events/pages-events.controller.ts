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
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PagesEventsService } from './pages-events.service';
import { CreateEventDto } from 'src/modules/events/events/dto/createEvents.dto';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatePosterInterceptor } from 'src/modules/common/upload-media/interceptors/validate-poster.interceptor';

@UseGuards(JwtAuthGuard)
@Controller('')
export class PagesEventsController {
  constructor(private readonly pagesEventsService: PagesEventsService) {}

  @Post('create-event')
  @UseInterceptors(ValidatePosterInterceptor, FileInterceptor('poster'))
  async createEvent(
    @Body() dto: CreateEventDto,
    @Req() req,
    @Param('slug') slug: string,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    const userId = req.user.id;
    try {
      return await this.pagesEventsService.createEvent(
        { dto, poster },
        slug,
        userId,
      );
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

  @Delete('/:id')
  async deleteEvent(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.pagesEventsService.deleteEvent(id, slug, userId);
    return { message: 'Event deleted' };
  }
}
