import { Module } from '@nestjs/common';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';

import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';

@Module({
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
  exports: [PostsService, PostsRepository],
  imports: [CommentsModule, ReactionsModule],
})
export class PostsModule {}
