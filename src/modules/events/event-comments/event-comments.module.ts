import { Module } from '@nestjs/common';
import { EventCommentsService } from './event-comments.service';
import { EventCommentsController } from './event-comments.controller';
import { CommentsModule } from 'src/modules/shared-modules/comments/comments.module';

@Module({
  imports: [CommentsModule],
  providers: [EventCommentsService],
  controllers: [EventCommentsController],
})
export class EventCommentsModule {}
