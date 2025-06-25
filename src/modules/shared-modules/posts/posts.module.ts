import { Module } from '@nestjs/common';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';

import { PostCommentsModule } from './comments/post-comments.module';
import { PostReactionsModule } from './reactions/post-reactions.module';
import { RouterModule } from '@nestjs/core';
import { CommentsModule } from '../comments/comments.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

const postsRoutes = [
  { path: '/', module: PostCommentsModule },
  { path: 'reactions', module: PostReactionsModule },
];

@Module({
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
  exports: [PostsService, PostsRepository],
  imports: [
    PostCommentsModule,
    PostReactionsModule,
    CommentsModule,

    RouterModule.register([
      { path: 'posts', module: PostsModule, children: postsRoutes },
    ]),
  ],
})
export class PostsModule {}
