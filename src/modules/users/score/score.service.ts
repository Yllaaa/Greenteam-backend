import { Injectable } from '@nestjs/common';
import { ScoreRepository } from './score.repository';
import { ProfileRepository } from '../profile/profile.repository';
@Injectable()
export class ScoreService {
  constructor(
    private readonly scoreRepository: ScoreRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}
  async getMainTopicsScore(userId: string) {
    return this.scoreRepository.getMainTopicsScore(userId);
  }

  async getSubTopicsScore(userId: string, topicId: number) {
    return this.scoreRepository.getSubTopicsScore(userId, topicId);
  }

  async getUserStats(userId: string) {
    const userScore = await this.profileRepository.getUserScore(userId);
    const userStats = await this.scoreRepository.getUserStats(userId);

    return {
      ...userStats,
      score: userScore,
    };
  }
}
