import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repositories/posts.repository';
import { CommentsRepository } from './repositories/comments.repository';

@Module({
  providers: [PostsService, PostsRepository, CommentsRepository],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
