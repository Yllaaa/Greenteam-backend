import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceRepository } from './marketplace.repository';

@Module({
  providers: [MarketplaceService, MarketplaceRepository],
  controllers: [MarketplaceController],
  exports: [MarketplaceService, MarketplaceRepository],
})
export class MarketplaceModule {}
