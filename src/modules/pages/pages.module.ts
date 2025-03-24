import { Module } from '@nestjs/common';
import { PagesController } from './pages/pages.controller';
import { PagesService } from './pages/pages.service';
import { PagesRepository } from './pages/pages.repository';
import { ProductsModule } from './products/products.module';

@Module({
  controllers: [PagesController],
  providers: [PagesService, PagesRepository],
  imports: [ProductsModule],
  exports: [PagesService, PagesRepository],
})
export class PagesModule {}
