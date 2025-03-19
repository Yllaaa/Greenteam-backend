import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentsModule } from '../payments.module';

@Module({
  imports: [forwardRef(() => PaymentsModule)],
  providers: [StripeService, StripeWebhookService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
