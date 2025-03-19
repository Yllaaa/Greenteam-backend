import { forwardRef, Module } from '@nestjs/common';
import { StripeModule } from './stripe/stripe.module';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { PaymentsRepository } from './payments/payments.repository';

import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { RouterModule } from '@nestjs/core';
const paymentsRoutes = [{ path: '/stripe', module: StripeModule }];
@Module({
  imports: [
    StripeModule,
    forwardRef(() => SubscriptionsModule),
    RouterModule.register([
      { path: 'payments', module: PaymentsModule, children: paymentsRoutes },
    ]),
  ],
  exports: [PaymentsService, PaymentsRepository],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
