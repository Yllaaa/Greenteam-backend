import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';

@Processor('pointsQueue')
export class PointsQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(PointsQueueProcessor.name);

  constructor(private readonly pointingSystemService: PointingSystemService) {
    super();
  }

  @OnWorkerEvent('failed')
  handleFailedJob(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed: ${err.message}`,
      err.stack,
    );
  }

  async process(job: Job<any>): Promise<any> {
    const { userId, topicId, action } = job.data;
    this.logger.log(`Processing job ${job.id}: ${job.name} for user ${userId}`);

    try {
      let result;
      if (job.name === 'awardPoints') {
        result = await this.pointingSystemService.awardPoints(
          userId,
          topicId,
          action,
        );
        this.logger.log(`Successfully awarded points for user ${userId}`);
        return result;
      } else if (job.name === 'removeAward') {
        result = await this.pointingSystemService.removeAward(
          userId,
          topicId,
          action,
        );
        this.logger.log(`Successfully removed award for user ${userId}`);
        return result;
      } else {
        const errorMsg = `Unknown job name: ${job.name}`;
        this.logger.warn(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id} (${job.name}):`,
        error.stack,
      );
      throw error;
    }
  }
}
