import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { PagesModule } from '../pages/pages.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { EventsModule } from '../events/events.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [PagesModule, MarketplaceModule, EventsModule, GroupsModule],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
