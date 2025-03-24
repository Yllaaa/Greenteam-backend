import { forwardRef, Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MarketplaceModule } from 'src/modules/marketplace/marketplace.module';
import { PagesModule } from '../pages.module';

@Module({
  imports: [MarketplaceModule, forwardRef(() => PagesModule)],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
