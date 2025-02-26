import { Module } from '@nestjs/common';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { ReactionsModule } from '../../reactions/reactions.module';
import { ChallengesModule } from 'src/modules/challenges/challenges.module';

@Module({
  imports: [ReactionsModule, ChallengesModule],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class PostReactionsModule {}
