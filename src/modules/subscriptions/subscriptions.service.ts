import {
  Injectable,
  HttpException,
  HttpCode,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { SubscriptionsRepository } from './subscriptions.repository';
import { PaymentsService } from '../payments/payments/payments.service';
import { StripeService } from '../payments/stripe/stripe.service';
import Stripe from 'stripe';
import { SubscriptionStatus } from '../db/schemas/schema';
@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}
  private readonly logger = new Logger(SubscriptionsService.name);
  async getSubscriptionTiers() {
    const tiers = await this.subscriptionsRepository.getSubscriptionTiers();
    const formattedResponse = tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      benefits: tier.TierBenefits.map((tb) => tb.benefit.benefit),
    }));
    return formattedResponse;
  }

  async createSubscription(userId: string, tierId: number) {
    const tier = await this.subscriptionsRepository.getTierById(tierId);
    if (!tier) {
      throw new NotFoundException('Subscription tier not found');
    }

    const existingSubscription =
      await this.subscriptionsRepository.getUserSubscription(userId);
    if (existingSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    try {
      const user = await this.paymentsService.getUserStripeCustomerId(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await this.stripeService.createCustomer(
          user.email,
          user.fullName,
        );
        stripeCustomerId = customer.id;

        await this.paymentsService.setUserStripeCustomerId(
          userId,
          stripeCustomerId,
        );
      }

      let stripeProductId = tier.stripeProductId;
      let stripePriceId = tier.stripePriceId;

      if (!stripeProductId || !stripePriceId) {
        const product = await this.stripeService.createProduct(
          tier.name,
          `${tier.name} subscription plan`,
        );
        stripeProductId = product.id;

        const price = await this.stripeService.createPrice(
          stripeProductId,
          tier.price,
        );
        stripePriceId = price.id;

        await this.subscriptionsRepository.updateTier(
          tierId,
          stripeProductId,
          stripePriceId,
        );
      }

      const stripeSubscription = await this.stripeService.createSubscription(
        stripeCustomerId,
        stripePriceId,
      );
      const subscriptionId = stripeSubscription.id;

      let clientSecret: string | null = null;
      if (
        stripeSubscription.latest_invoice &&
        typeof stripeSubscription.latest_invoice !== 'string'
      ) {
        const latestInvoice =
          stripeSubscription.latest_invoice as Stripe.Invoice;

        if (
          latestInvoice.payment_intent &&
          typeof latestInvoice.payment_intent !== 'string'
        ) {
          clientSecret =
            (latestInvoice.payment_intent as Stripe.PaymentIntent)
              .client_secret || null;
        }
      }

      await this.subscriptionsRepository.createSubscription(
        userId,
        tierId,
        subscriptionId,
      );

      return {
        subscriptionId,
        clientSecret,
      };
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async getUserActiveSubscription(userId: string) {
    const subscription =
      await this.subscriptionsRepository.getUserActiveSubscription(userId);

    if (!subscription) {
      return null;
    }
    return subscription;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return await this.subscriptionsRepository.getSubscriptionByStripeId(
      stripeSubscriptionId,
    );
  }

  async createSubscriptionInvoice(
    subscription,
    stripeInvoice,
    stripeInvoiceId: string,
    paymentId: string,
  ) {
    return await this.subscriptionsRepository.createSubscriptionInvoice(
      subscription,
      stripeInvoice,
      stripeInvoiceId,
      paymentId,
    );
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
  ) {
    return await this.subscriptionsRepository.updateSubscriptionStatus(
      subscriptionId,
      status,
    );
  }

  // for testing
  async deleteUserSubscription(userId: string) {
    return await this.subscriptionsRepository.softDeleteUserSubscription(
      userId,
    );
  }
}
