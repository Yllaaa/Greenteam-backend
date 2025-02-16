import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsModule } from 'src/modules/shared-modules/comments/comments.module';
import { ForumService } from '../publications/forum.service';
import { ForumRepository } from '../publications/forum.repository';

@Module({
  controllers: [CommentsController],
  imports: [CommentsModule],
  providers: [ForumService, ForumRepository],
})
export class forumCommentsModule {}
