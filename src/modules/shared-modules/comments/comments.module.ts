import { Module } from '@nestjs/common';
import { CommentsRepository } from './repositories/comments.repository';
import { RepliesRepository } from './repositories/replies.repository';
import { CommentsService } from './comments.service';

@Module({
  providers: [CommentsRepository, RepliesRepository, CommentsService],
  controllers: [],
  exports: [CommentsService, RepliesRepository],
})
export class CommentsModule {}
