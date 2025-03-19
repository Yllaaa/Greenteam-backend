import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { subscriptionTiers, usersSubscriptions } from '../db/schemas/schema';
import { subscriptionsInvoice } from '../db/schemas/subscriptions/payments';
@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const tiers = await this.drizzleService.db.query.subscriptionTiers.findMany(
      {
        columns: {
          id: true,
          name: true,
          price: true,
        },
        with: {
          TierBenefits: {
            columns: {},
            with: {
              benefit: {
                columns: {
                  benefit: true,
                },
              },
            },
          },
        },
      },
    );

    return tiers as SubscriptionTier[];
  }

  async getTierById(tierId: string) {
    return await this.drizzleService.db.query.subscriptionTiers.findFirst({
      where: eq(usersSubscriptions.id, tierId),
      columns: {
        id: true,
        name: true,
        price: true,
        stripeProductId: true,
        stripePriceId: true,
      },
    });
  }

  async getUserSubscription(userId: string) {
    return await this.drizzleService.db.query.usersSubscriptions.findFirst({
      where: and(
        eq(usersSubscriptions.userId, userId),
        eq(usersSubscriptions.status, 'active'),
      ),
    });
  }

  async updateTier(
    tierId: string,
    stripeProductId: string,
    stripePriceId: string,
  ) {
    await this.drizzleService.db
      .update(subscriptionTiers)
      .set({
        stripeProductId,
        stripePriceId,
      })
      .where(eq(subscriptionTiers.id, tierId));
  }

  async createSubscription(
    userId: string,
    tierId: string,
    stripeSubscriptionId: string,
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);
    await this.drizzleService.db.insert(usersSubscriptions).values({
      userId,
      tierId,
      status: 'pending',
      startDate: startDate,
      endDate: endDate,
      autoRenew: true,
      stripeSubscriptionId,
    });
  }

  async getUserActiveSubscription(userId: string) {
    return await this.drizzleService.db.query.usersSubscriptions.findFirst({
      where: and(
        eq(usersSubscriptions.userId, userId),
        eq(usersSubscriptions.status, 'active'),
      ),
    });
  }
  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    const subscription =
      await this.drizzleService.db.query.usersSubscriptions.findFirst({
        where: eq(
          usersSubscriptions.stripeSubscriptionId,
          stripeSubscriptionId,
        ),
      });
    return subscription;
  }

  async createSubscriptionInvoice(
    subscription,
    stripeInvoice,
    stripeInvoiceId: string,
    paymentId: string,
  ) {
    await this.drizzleService.db.insert(subscriptionsInvoice).values({
      paymentId,
      userId: subscription.userId,
      stripeInvoiceId,
      amount: stripeInvoice.amount_paid / 100,
      currency: stripeInvoice.currency,
      pdfUrl: stripeInvoice.invoice_pdf,
    });
  }

  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    await this.drizzleService.db
      .update(usersSubscriptions)
      .set({ status })
      .where(eq(usersSubscriptions.id, subscriptionId));
  }
}
