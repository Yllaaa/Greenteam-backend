import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';

@Processor('pointsQueue')
export class PointsQueueProcessor extends WorkerHost {
  constructor(private readonly pointingSystemService: PointingSystemService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { userId, topicId, action, points } = job.data;

    try {
      await this.pointingSystemService.awardPoints(
        userId,
        topicId,
        action,
        points,
      );
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error;
    }
  }
}
