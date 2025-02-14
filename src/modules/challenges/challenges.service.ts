import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from './challenges.repository';
@Injectable()
export class ChallengesService {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  async createDoPostChallenge(userId: string, postId: string) {
    return await this.challengesRepository.createDoPostChallenge(
      userId,
      postId,
    );
  }

  async deleteDoPostChallenge(userId: string, postId: string) {
    return await this.challengesRepository.deleteDoPostChallenge(
      userId,
      postId,
    );
  }
  async getUsersDoPosts(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    return await this.challengesRepository.getUsersDoPosts(userId, pagination);
  }
}
