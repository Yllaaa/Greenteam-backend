import { Module } from '@nestjs/common';
import { ForumController } from './publications/forum.controller';
import { ForumRepository } from './publications/forum.repository';
import { ForumService } from './publications/forum.service';
import { RouterModule } from '@nestjs/core';
import { forumCommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { CommentsModule } from '../shared-modules/comments/comments.module';

const postsRoutes = [
  { path: '/', module: forumCommentsModule },
  { path: 'reactions', module: ReactionsModule },
];

@Module({
  controllers: [ForumController],
  providers: [ForumService, ForumRepository],
  imports: [
    RouterModule.register([
      { path: 'forum', module: ForumModule, children: postsRoutes },
    ]),
    forumCommentsModule,
    CommentsModule,
    ReactionsModule,
  ],
})
export class ForumModule {}
