import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionsService } from 'src/modules/subscriptions/subscriptions.service';
@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}
  private readonly logger = new Logger(SubscriptionsService.name);

  async getUserStripeCustomerId(userId: string) {
    return this.paymentsRepository.getUserStripeCustomerId(userId);
  }

  async setUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    return this.paymentsRepository.setUserStripeCustomerId(
      userId,
      stripeCustomerId,
    );
  }

  async handlePaymentSucceeded(
    stripeSubscriptionId: string,
    stripeInvoiceId: string,
  ) {
    const subscription =
      await this.subscriptionsService.getSubscriptionByStripeId(
        stripeSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const stripeInvoice = await this.stripeService.getInvoice(stripeInvoiceId);

    const [payment] = await this.paymentsRepository.createPaymentRecord(
      subscription,
      stripeInvoice,
      'succeeded',
    );

    await this.subscriptionsService.createSubscriptionInvoice(
      subscription,
      stripeInvoice,
      stripeInvoiceId,
      payment.id,
    );

    if (subscription.status === 'pending') {
      await this.subscriptionsService.updateSubscriptionStatus(
        subscription.id,
        'active',
      );
    }
    return { success: true };
  }

  async handlePaymentFailed(
    stripeSubscriptionId: string,
    stripeInvoiceId: string,
  ) {
    const subscription =
      await this.subscriptionsService.getSubscriptionByStripeId(
        stripeSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const stripeInvoice = await this.stripeService.getInvoice(stripeInvoiceId);

    await this.paymentsRepository.createPaymentRecord(
      subscription,
      stripeInvoice,
      'failed',
    );

    if (subscription.status === 'pending') {
      await this.subscriptionsService.updateSubscriptionStatus(
        subscription.id,
        'failed',
      );
    } else if (subscription.status === 'active') {
      this.logger.warn(
        `Renewal payment failed for subscription ${subscription.id}`,
      );
    }

    return { success: true };
  }
}
