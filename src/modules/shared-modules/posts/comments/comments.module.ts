import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './repositories/comments.repository';
import { RepliesRepository } from './repositories/replies.repository';
import { PostsModule } from '../posts.module';
import { PostsRepository } from '../posts/posts.repository';
import { PostsService } from '../posts/posts.service';

@Module({
  providers: [
    CommentsService,
    CommentsRepository,
    RepliesRepository,
    PostsRepository,
    PostsService,
  ],
  exports: [CommentsService, CommentsRepository, RepliesRepository],
  controllers: [CommentsController],
})
export class CommentsModule {}
