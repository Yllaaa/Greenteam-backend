import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('pointsQueue') private pointsQueue: Queue) {}

  async addPointsJob(userId: string, topicId: number, action: Action) {
    await this.pointsQueue.add(
      'awardPoints',
      {
        userId,
        topicId,
        action,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async removePointsJob(userId: string, topicId: number, action: Action) {
    await this.pointsQueue.add(
      'removeAward',
      {
        userId,
        topicId,
        action,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
