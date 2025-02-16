import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CommentsController } from './comments.controller';
import { RepliesRepository } from '../../comments/repositories/replies.repository';
import { PostsService } from '../posts/posts.service';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsModule } from '../../comments/comments.module';

@Module({
  imports: [CommentsModule],
  providers: [
    PostCommentsService,

    CommentsRepository,
    RepliesRepository,
    PostsRepository,
    PostsService,
  ],
  exports: [PostCommentsService, CommentsRepository],
  controllers: [CommentsController],
})
export class PostCommentsModule {}
