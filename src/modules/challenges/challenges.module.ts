import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { ChallengesRepository } from './challenges.repository';

@Module({
  providers: [ChallengesService, ChallengesRepository],
  controllers: [ChallengesController],
  exports: [ChallengesService],
})
export class ChallengesModule {}
