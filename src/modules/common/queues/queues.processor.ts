import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';

@Processor('pointsQueue')
export class PointsQueueProcessor extends WorkerHost {
  constructor(private readonly pointingSystemService: PointingSystemService) {
    super();
  }
  @OnWorkerEvent('failed')
  handleFailedJob(job: Job, err: Error) {
    console.error(`Job ${job.id} failed: ${err.message}`);
  }
  async process(job: Job<any>): Promise<void> {
    const { userId, topicId, action } = job.data;
    try {
      if (job.name === 'awardPoints') {
        await this.pointingSystemService.awardPoints(userId, topicId, action);
      } else if (job.name === 'removeAward') {
        await this.pointingSystemService.removeAward(userId, topicId, action);
      } else {
        console.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error;
    }
  }
}
