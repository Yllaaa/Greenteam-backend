import { Module } from '@nestjs/common';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { RepliesRepository } from './comments/repositories/replies.repository';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { PostsModule } from './posts/posts.module';

@Module({
  providers: [
    PostsService,
    PostsRepository,
    CommentsRepository,
    RepliesRepository,
  ],
  controllers: [PostsController],
  exports: [PostsService],
  imports: [CommentsModule, ReactionsModule, PostsModule],
})
export class PostsContainerModule {}
