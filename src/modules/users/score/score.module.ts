import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { ScoreRepository } from './score.repository';

@Module({
  providers: [ScoreService, ScoreRepository],
  controllers: [ScoreController],
})
export class ScoreModule {}
