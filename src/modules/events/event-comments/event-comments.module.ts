import { Module } from '@nestjs/common';
import { EventCommentsService } from './event-comments.service';
import { EventCommentsController } from './event-comments.controller';
import { CommentsModule } from 'src/modules/shared-modules/comments/comments.module';
import { EventCommentsReactionsModule } from './reactions/reactions.module';

@Module({
  imports: [CommentsModule, EventCommentsReactionsModule],
  providers: [EventCommentsService],
  controllers: [EventCommentsController],
})
export class EventCommentsModule {}
