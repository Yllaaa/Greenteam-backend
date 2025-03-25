import { Module } from '@nestjs/common';
import { PagesController } from './pages/pages.controller';
import { PagesService } from './pages/pages.service';
import { PagesRepository } from './pages/pages.repository';
import { ProductsModule } from './products/products.module';
import { RouterModule } from '@nestjs/core';
import { products } from '../db/schemas/schema';

const paymentsRoutes = [{ path: '', module: ProductsModule }];

@Module({
  controllers: [PagesController],
  providers: [PagesService, PagesRepository],
  imports: [
    ProductsModule,
    RouterModule.register([
      { path: 'pages', module: PagesModule, children: paymentsRoutes },
    ]),
  ],
  exports: [PagesService, PagesRepository],
})
export class PagesModule {}
