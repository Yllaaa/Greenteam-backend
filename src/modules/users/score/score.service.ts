import { Injectable } from '@nestjs/common';
import { ScoreRepository } from './score.repository';
@Injectable()
export class ScoreService {
  constructor(private readonly scoreRepository: ScoreRepository) {}
  async getMainTopicsScore(userId: string) {
    return this.scoreRepository.getMainTopicsScore(userId);
  }

  async getSubTopicsScore(userId: string, topicId: number) {
    return this.scoreRepository.getSubTopicsScore(userId, topicId);
  }

  async getUserStats(userId: string) {
    return this.scoreRepository.getUserStats(userId);
  }
}
