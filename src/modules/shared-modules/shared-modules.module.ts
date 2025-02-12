import { Module } from '@nestjs/common';
import { PostsContainerModule } from './posts/posts.module';
import { RouterModule } from '@nestjs/core';
import { CommentsModule } from './posts/comments/comments.module';
import { ReactionsModule } from './posts/reactions/reactions.module';

const postsRoutes = [
  { path: 'comments', module: CommentsModule },
  { path: 'reactions', module: ReactionsModule },
];

@Module({
  imports: [
    PostsContainerModule,
    RouterModule.register([
      { path: 'posts', module: PostsContainerModule, children: postsRoutes },
    ]),
  ],
})
export class SharedModulesModule {}
