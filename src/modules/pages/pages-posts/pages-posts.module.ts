import { forwardRef, Module } from '@nestjs/common';
import { PagesPostsController } from './pages-posts.controller';
import { PagesPostsService } from './pages-posts.service';
import { PostsModule } from 'src/modules/shared-modules/posts/posts.module';
import { PagesModule } from '../pages.module';

@Module({
  imports: [PostsModule, forwardRef(() => PagesModule)],
  controllers: [PagesPostsController],
  providers: [PagesPostsService],
})
export class PagesPostsModule {}
