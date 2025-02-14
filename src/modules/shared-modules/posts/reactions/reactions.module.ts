import { Module } from '@nestjs/common';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { ReactionsRepository } from './reactions.repository';
import { ChallengesModule } from 'src/modules/challenges/challenges.module';

@Module({
  imports: [ChallengesModule],
  controllers: [ReactionsController],
  providers: [ReactionsService, ReactionsRepository],
})
export class ReactionsModule {}
