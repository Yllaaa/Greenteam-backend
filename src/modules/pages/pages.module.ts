import { forwardRef, Module } from '@nestjs/common';
import { PagesController } from './pages/pages.controller';
import { PagesService } from './pages/pages.service';
import { PagesRepository } from './pages/pages.repository';
import { PagesProductsModule } from './products/products.module';
import { RouterModule } from '@nestjs/core';
import { PagesPostsModule } from './pages-posts/pages-posts.module';

const pagesRoutes = [
  { path: ':slug/products', module: PagesProductsModule },
  { path: ':slug/posts', module: PagesPostsModule },
];

@Module({
  controllers: [PagesController],
  providers: [PagesService, PagesRepository],
  imports: [
    forwardRef(() => PagesProductsModule),
    RouterModule.register([
      { path: 'pages', module: PagesModule, children: pagesRoutes },
    ]),
    PagesPostsModule,
  ],
  exports: [PagesService, PagesRepository],
})
export class PagesModule {}
