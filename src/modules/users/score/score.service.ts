import { Injectable } from '@nestjs/common';
import { ScoreRepository } from './score.repository';
@Injectable()
export class ScoreService {
  constructor(private readonly scoreRepository: ScoreRepository) {}
  async getMainTopicsScore(userId: string) {
    return this.scoreRepository.getMainTopicsScore(userId);
  }
}
