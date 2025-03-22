import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { PaymentsModule } from '../payments/payments.module';
import { StripeModule } from '../payments/stripe/stripe.module';
import { SubscriptionsExpirationService } from './subscriptions-expiration.service';

@Module({
  imports: [StripeModule, PaymentsModule],
  exports: [SubscriptionsService, SubscriptionsRepository],
  providers: [
    SubscriptionsService,
    SubscriptionsRepository,
    SubscriptionsExpirationService,
  ],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
