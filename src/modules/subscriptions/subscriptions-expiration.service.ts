import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsRepository } from './subscriptions.repository';

@Injectable()
export class SubscriptionsExpirationService {
  private readonly logger = new Logger(SubscriptionsExpirationService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions');
    const now = new Date();

    try {
      const expiredSubscriptions =
        await this.subscriptionsRepository.findExpiredSubscriptions(now);

      this.logger.log(
        `Found ${expiredSubscriptions.length} expired subscriptions`,
      );

      for (const subscription of expiredSubscriptions) {
        this.logger.log(
          `Expiring subscription ${subscription.id} for user ${subscription.userId}`,
        );

        await this.subscriptionsRepository.updateSubscriptionStatus(
          subscription.id,
          'expired',
        );
      }
    } catch (error) {
      this.logger.error(
        'Error checking for expired subscriptions',
        error.stack,
      );
    }
  }
}
