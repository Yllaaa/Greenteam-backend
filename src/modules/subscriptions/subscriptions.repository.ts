import { Injectable } from '@nestjs/common';
import { and, asc, eq, lt } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  pages,
  SubscriptionStatus,
  subscriptionTiers,
  users,
  usersSubscriptions,
} from '../db/schemas/schema';
import { subscriptionsInvoice } from '../db/schemas/subscriptions/payments';
import { SubscriptionTier } from './interfaces/tiers.interface';
@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const tiers = await this.drizzleService.db.query.subscriptionTiers.findMany(
      {
        columns: {
          id: true,
          nameEn: true,
          nameEs: true,
          price: true,
          isDirectlySubscriptable: true,
        },
        with: {
          TierBenefits: {
            columns: {},
            with: {
              benefit: {
                columns: {
                  benefitEn: true,
                  benefitEs: true,
                },
              },
            },
          },
        },
        orderBy: (table) => [asc(table.id)],
      },
    );

    return tiers as SubscriptionTier[];
  }

  async getTierById(tierId: number) {
    return await this.drizzleService.db.query.subscriptionTiers.findFirst({
      where: eq(subscriptionTiers.id, tierId),
      columns: {
        id: true,
        nameEn: true,
        nameEs: true,
        price: true,
        stripeProductId: true,
        stripePriceId: true,
      },
    });
  }

  async getUserSubscriptionByUserId(userId: string, tx?: any) {
    const queryRunner = tx || this.drizzleService.db;
    return await queryRunner.query.usersSubscriptions.findFirst({
      where: and(
        eq(usersSubscriptions.userId, userId),
        eq(usersSubscriptions.status, 'active'),
      ),
      with: {
        tier: {
          columns: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  async updateTier(
    tierId: number,
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
    tierId: number,
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
      with: {
        tier: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  async getSubscriptionByStripeId(stripeSubscriptionId: string, tx?: any) {
    const queryRunner = tx || this.drizzleService.db;
    const subscription = await queryRunner.query.usersSubscriptions.findFirst({
      where: eq(usersSubscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
    return subscription;
  }

  async createSubscriptionInvoice(
    subscription,
    stripeInvoice,
    stripeInvoiceId: string,
    paymentId: string,
    tx?: any,
  ) {
    const queryRunner = tx || this.drizzleService.db;
    await queryRunner.insert(subscriptionsInvoice).values({
      paymentId,
      userId: subscription.userId,
      stripeInvoiceId,
      amount: stripeInvoice.amount_paid / 100,
      currency: stripeInvoice.currency,
      pdfUrl: stripeInvoice.invoice_pdf,
    });
  }

  async makeUserVerified(userId: string, tx?: any) {
    const queryRunner = tx || this.drizzleService.db;
    await queryRunner
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId));
  }
  async makeUserPagesVerified(userId: string, tx?: any) {
    const queryRunner = tx || this.drizzleService.db;
    await queryRunner
      .update(pages)
      .set({ isVerified: true })
      .where(eq(pages.ownerId, userId));
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    tx?: any,
  ) {
    await (tx || this.drizzleService.db)
      .update(usersSubscriptions)
      .set({ status })
      .where(eq(usersSubscriptions.id, subscriptionId));
  }

  async findExpiredSubscriptions(now: Date) {
    return await this.drizzleService.db.query.usersSubscriptions.findMany({
      where: and(
        eq(usersSubscriptions.status, 'active'),
        lt(usersSubscriptions.endDate, now),
      ),
    });
  }

  // for testing only
  async softDeleteUserSubscription(userId: string) {
    await this.drizzleService.db
      .update(usersSubscriptions)
      .set({ status: 'canceled' })
      .where(eq(usersSubscriptions.userId, userId));
  }
}
