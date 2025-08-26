import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { SubscriptionsRepository } from './subscriptions.repository';
import { PaymentsService } from '../payments/payments/payments.service';
import { StripeService } from '../payments/stripe/stripe.service';
import Stripe from 'stripe';
import { SubscriptionStatus } from '../db/schemas/schema';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  async getSubscriptionTiers(lang?: string) {
    const tiers = await this.subscriptionsRepository.getSubscriptionTiers();
    return tiers.map((tier) => ({
      id: tier.id,
      name: this.getLocalizedValue(tier.nameEn, tier.nameEs, lang),
      price: tier.price,
      isDirectlySubscriptable: tier.isDirectlySubscriptable,
      benefits: tier.TierBenefits.map((tb) =>
        this.getLocalizedValue(
          tb.benefit.benefitEn,
          tb.benefit.benefitEs,
          lang,
        ),
      ),
    }));
  }

  async getUserSubscriptionByUserId(userId: string, tx?: any) {
    return await this.subscriptionsRepository.getUserSubscriptionByUserId(
      userId,
      tx,
    );
  }

  async createSubscription(userId: string, tierId: number) {
    // 1. Validate tier and check if user can subscribe
    const tier = await this.subscriptionsRepository.getTierById(tierId);
    if (!tier) {
      throw new NotFoundException(
        'subscriptions.subscriptions.errors.SUBSCRIPTION_NOT_FOUND',
      );
    }

    // 2. Check existing subscription and validate upgrade path
    const existingSubscription =
      await this.subscriptionsRepository.getUserSubscriptionByUserId(userId);

    if (existingSubscription?.tierId === tierId) {
      throw new ConflictException(
        'subscriptions.subscriptions.validations.ALREADY_ACTIVE_SUBSCRIPTION',
      );
    }
    if (
      !Array.isArray(existingSubscription?.tier) &&
      existingSubscription?.tier.price > tier.price
    ) {
      throw new ConflictException(
        'subscriptions.subscriptions.validations.CANNOT_DOWNGRADE_SUBSCRIPTION',
      );
    }

    try {
      // 3. Get or create Stripe customer
      const user = await this.paymentsService.getUserStripeCustomerId(userId);
      if (!user) {
        throw new NotFoundException('users.profiles.errors.USER_NOT_FOUND');
      }
      const stripeCustomerId = await this.getOrCreateStripeCustomer(user);

      // 4. Get or create Stripe product and price
      const { stripeProductId, stripePriceId } =
        await this.getOrCreateStripePricing(tier);

      // 5. Create the subscription in Stripe
      const { subscriptionId, clientSecret } =
        await this.createStripeSubscription(stripeCustomerId, stripePriceId);

      // 6. Save subscription in database
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
      throw new InternalServerErrorException(
        'subscriptions.subscriptions.errors.FAILED_CREATE_SUBSCRIPTION',
      );
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

  async getSubscriptionByStripeId(stripeSubscriptionId: string, tx?: any) {
    return await this.subscriptionsRepository.getSubscriptionByStripeId(
      stripeSubscriptionId,
      tx,
    );
  }

  async createSubscriptionInvoice(
    subscription,
    stripeInvoice,
    stripeInvoiceId: string,
    paymentId: string,
    tx?: any,
  ) {
    return await this.subscriptionsRepository.createSubscriptionInvoice(
      subscription,
      stripeInvoice,
      stripeInvoiceId,
      paymentId,
      tx,
    );
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    tx?: any,
  ) {
    return await this.subscriptionsRepository.updateSubscriptionStatus(
      subscriptionId,
      status,
      tx,
    );
  }

  // Handle new subscriptions
  async handleTier1Subscription(userId: string, tx?: any) {
    await this.subscriptionsRepository.makeUserVerified(userId, tx);
  }
  async handleTier2Subscription(userId: string, tx?: any) {
    await this.subscriptionsRepository.makeUserPagesVerified(userId, tx);
  }

  async handleTier3Subscription(userId: string, tx?: any) {}

  // for testing
  async deleteUserSubscription(userId: string) {
    return await this.subscriptionsRepository.softDeleteUserSubscription(
      userId,
    );
  }

  private async getOrCreateStripeCustomer(user: any): Promise<string> {
    let { stripeCustomerId } = user;

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.fullName,
      );
      stripeCustomerId = customer.id;
      await this.paymentsService.setUserStripeCustomerId(
        user.id,
        stripeCustomerId,
      );
    }

    return stripeCustomerId;
  }

  private async getOrCreateStripePricing(
    tier: any,
  ): Promise<{ stripeProductId: string; stripePriceId: string }> {
    let { stripeProductId, stripePriceId } = tier;

    if (!stripeProductId || !stripePriceId) {
      const product = await this.stripeService.createProduct(
        tier.nameEn,
        `${tier.nameEn} subscription plan`,
      );
      stripeProductId = product.id;

      const price = await this.stripeService.createPrice(
        stripeProductId,
        tier.price,
      );
      stripePriceId = price.id;

      await this.subscriptionsRepository.updateTier(
        tier.id,
        stripeProductId,
        stripePriceId,
      );
    }

    return { stripeProductId, stripePriceId };
  }

  private async createStripeSubscription(
    stripeCustomerId: string,
    stripePriceId: string,
  ): Promise<{ subscriptionId: string; clientSecret: string | null }> {
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
      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      if (
        latestInvoice.payment_intent &&
        typeof latestInvoice.payment_intent !== 'string'
      ) {
        clientSecret =
          (latestInvoice.payment_intent as Stripe.PaymentIntent)
            .client_secret || null;
      }
    }

    return { subscriptionId, clientSecret };
  }

  async handleExistingSubscription(
    existingSubscription: any,
    tx?,
  ): Promise<void> {
    if (existingSubscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(
        existingSubscription.stripeSubscriptionId,
        { prorate: true },
      );
    }

    await this.subscriptionsRepository.updateSubscriptionStatus(
      existingSubscription.id,
      'upgraded',
      tx,
    );
  }

  private getLocalizedValue(
    enValue: string,
    esValue: string,
    lang?: string,
  ): string {
    return lang === 'es' ? esValue : enValue;
  }
}
