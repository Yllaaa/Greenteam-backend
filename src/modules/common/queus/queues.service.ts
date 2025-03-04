import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('pointsQueue') private pointsQueue: Queue) {}

  async addPointsJob(
    userId: string,
    topicId: string,
    action: any,
    points: number,
  ) {
    await this.pointsQueue.add('awardPoints', {
      userId,
      topicId,
      action,
      points,
    });
  }
}
