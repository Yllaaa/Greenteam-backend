import { Module } from '@nestjs/common';
import { PostsContainerModule } from './posts/posts.module';

@Module({
  imports: [PostsContainerModule],
})
export class SharedModulesModule {}
