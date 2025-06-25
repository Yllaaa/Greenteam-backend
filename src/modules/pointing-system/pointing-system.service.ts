import { Injectable } from '@nestjs/common';
import { Action, PointingSystemRepository } from './pointing-system.repository';

@Injectable()
export class PointingSystemService {
  constructor(
    private readonly pointingSystemRepository: PointingSystemRepository,
  ) {}
  async awardPoints(userId: string, topicId: number, action: Action) {
    return this.pointingSystemRepository.awardPoints(userId, topicId, action);
  }

  async removeAward(userId: string, topicId: number, action: Action) {
    return this.pointingSystemRepository.removeAward(userId, topicId, action);
  }
}
