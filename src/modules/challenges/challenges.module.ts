import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { ChallengesRepository } from './challenges.repository';
import { PostsService } from '../shared-modules/posts/posts/posts.service';
import { PostsRepository } from '../shared-modules/posts/posts/posts.repository';

@Module({
  providers: [
    ChallengesService,
    ChallengesRepository,
    PostsService,
    PostsRepository,
  ],
  controllers: [ChallengesController],
  exports: [ChallengesService],
})
export class ChallengesModule {}
