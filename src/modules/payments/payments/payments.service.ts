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
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly i18n: I18nService,
    private readonly drizzleService: DrizzleService,
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
  ): Promise<{ success: boolean }> {
    // Check if this webhook has been processed already (idempotency)
    const isProcessed =
      await this.paymentsRepository.isWebhookProcessed(stripeInvoiceId);
    if (isProcessed) {
      return { success: true };
    }

    // Use a transaction to ensure data consistency
    return await this.drizzleService.db.transaction(async (tx) => {
      // Find the subscription
      const subscription =
        await this.subscriptionsService.getSubscriptionByStripeId(
          stripeSubscriptionId,
          tx,
        );

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      // Get the invoice details
      const stripeInvoice =
        await this.stripeService.getInvoice(stripeInvoiceId);
      if (!stripeInvoice) {
        throw new NotFoundException('Invoice not found');
      }

      // Handle existing subscription if present
      const existingSubscription =
        await this.subscriptionsService.getUserSubscriptionByUserId(
          subscription.userId,
          tx,
        );

      if (existingSubscription) {
        await this.subscriptionsService.handleExistingSubscription(
          existingSubscription,
          tx,
        );
      }

      // Apply tier-specific benefits using a dedicated method
      await this.applyTierBenefits(
        subscription.userId,
        subscription.tierId,
        tx,
      );

      // Create payment record
      const payment = await this.paymentsRepository.createPaymentRecord(
        subscription,
        stripeInvoice,
        'succeeded',
        tx,
      );
      // Create invoice record
      await this.subscriptionsService.createSubscriptionInvoice(
        subscription,
        stripeInvoice,
        stripeInvoiceId,
        payment[0].id,
        tx,
      );

      // Update subscription status if pending
      if (subscription.status === 'pending') {
        await this.subscriptionsService.updateSubscriptionStatus(
          subscription.id,
          'active',
          tx,
        );
      }

      await this.paymentsRepository.markWebhookAsProcessed(
        stripeInvoiceId,
        tx,
        'invoice.payment_succeeded',
        { subscriptionId: subscription.id },
      );

      return { success: true };
    });
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
      throw new NotFoundException(
        'subscriptions.subscriptions.errors.SUBSCRIPTION_NOT_FOUND',
      );
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
        this.i18n.translate(
          'subscriptions.subscriptions.errors.RENEWAL_PAYMENT_FAILED',
          {
            args: { subscription_id: subscription.id },
          },
        ),
      );
    }

    return { success: true };
  }

  private async applyTierBenefits(
    userId: string,
    tierId: number,
    tx?: any,
  ): Promise<void> {
    // All tiers get user verification
    await this.subscriptionsService.handleTier1Subscription(userId, tx);

    // Tier 2 and above get page verification
    if (tierId >= 2) {
      await this.subscriptionsService.handleTier2Subscription(userId, tx);
    }

    // Tier 3 specific benefits
    if (tierId === 3) {
      // Currently identical to tier 2, but keeping separate for future differentiation
    }
  }
}
