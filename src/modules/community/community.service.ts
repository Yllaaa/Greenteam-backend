import { Injectable } from '@nestjs/common';
import { PagesService } from '../pages/pages/pages.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { EventsService } from '../events/events/events.service';
import { GetAllProductsDto } from '../marketplace/dtos/getAllProducts.dto';
import { GetAllPagesDto } from '../pages/pages/dto/get-pages.dto';
import { GetEventsDto } from '../events/events/dto/getEvents.dto';
import { GetAllGroupsDtos } from '../groups/groups/dtos/get-groups.dto';
import { GroupsService } from '../groups/groups/groups.service';
@Injectable()
export class CommunityService {
  constructor(
    private readonly pagesService: PagesService,
    private readonly marketplaceService: MarketplaceService,
    private readonly eventsService: EventsService,
    private readonly groupsService: GroupsService,
  ) {}

  async getAllPages(query: GetAllPagesDto, userId: string) {
    return await this.pagesService.getAllPages(query, userId);
  }

  async getAllProducts(query: GetAllProductsDto) {
    return this.marketplaceService.getAllProducts(query);
  }

  async getAllEvents(query: GetEventsDto, userId: string) {
    return this.eventsService.getEvents(query, userId);
  }

  async getAllGroups(query: GetAllGroupsDtos, userId: string) {
    return this.groupsService.getAllGroups(query, userId);
  }
}
