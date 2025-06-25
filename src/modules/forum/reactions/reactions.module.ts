import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ReactionsModule } from 'src/modules/shared-modules/reactions/reactions.module';
import { ForumService } from '../publications/forum.service';
import { ForumRepository } from '../publications/forum.repository';
import { PostsService } from 'src/modules/shared-modules/posts/posts/posts.service';
import { PostsRepository } from 'src/modules/shared-modules/posts/posts/posts.repository';

@Module({
  imports: [ReactionsModule],
  providers: [
    ReactionsService,
    ForumService,
    ForumRepository,
    PostsService,
    PostsRepository,
  ],
  controllers: [ReactionsController],
})
export class ForumReactionsModule {}
