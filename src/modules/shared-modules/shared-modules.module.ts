import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { RouterModule } from '@nestjs/core';
import { CommentsModule } from './posts/comments/comments.module';
import { ReactionsModule } from './posts/reactions/reactions.module';

const postsRoutes = [
  { path: '/', module: CommentsModule },
  { path: 'reactions', module: ReactionsModule },
];

@Module({
  imports: [
    PostsModule,
    RouterModule.register([
      { path: 'posts', module: PostsModule, children: postsRoutes },
    ]),
  ],
})
export class SharedModulesModule {}
