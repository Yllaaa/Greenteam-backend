import {
  Injectable,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

  async addGreenChallengeToUser(userId: string, challengeId: string) {
    if (
      !(await this.challengesRepository.findGreenChallengeById(challengeId))
    ) {
      throw new HttpException(
        'Green challenge not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      )
    ) {
      throw new HttpException(
        'Green challenge already added to user',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.challengesRepository.addGreenChallengeToUser(
      userId,
      challengeId,
    );
    return "Green challenge added to user's challenges";
  }

  async getGreenChallenges(pagination: { page: number; limit: number }) {
    return await this.challengesRepository.getGreenChallenges(pagination);
  }

  async getUsersDoPosts(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    return await this.challengesRepository.getUsersDoPosts(userId, pagination);
  }
}
