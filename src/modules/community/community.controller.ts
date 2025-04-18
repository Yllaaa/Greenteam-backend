import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetAllPagesDto } from '../pages/pages/dto/get-pages.dto';
import { GetAllProductsDto } from '../marketplace/dtos/getAllProducts.dto';
import { GetEventsDto } from '../events/events/dto/getEvents.dto';
import { GetAllGroupsDtos } from '../groups/groups/dtos/get-groups.dto';

@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('pages')
  async getAllPages(@Query() query: GetAllPagesDto, @Req() req) {
    const userId = req.user?.id;

    return this.communityService.getAllPages(query, userId);
  }

  @Get('products')
  async getAllProducts(@Query() query: GetAllProductsDto) {
    return this.communityService.getAllProducts(query);
  }

  @Get('events')
  async getAllEvents(@Query() query: GetEventsDto, @Req() req) {
    const userId = req.user?.id;

    return this.communityService.getAllEvents(query, userId);
  }

  @Get('groups')
  async getAllGroups(@Query() query: GetAllGroupsDtos, @Req() req) {
    const userId = req.user?.id;

    return this.communityService.getAllGroups(query, userId);
  }
}
