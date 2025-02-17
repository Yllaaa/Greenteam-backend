import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ReactionsRepository } from './reactions.repository';
import { ChallengesModule } from 'src/modules/challenges/challenges.module';

@Module({
  imports: [ChallengesModule],
  controllers: [ReactionsController],
  providers: [ReactionsService, ReactionsRepository],
  exports: [ReactionsService, ReactionsRepository],
})
export class ReactionsModule {}
