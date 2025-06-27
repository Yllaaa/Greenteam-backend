import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { users } from '../../db/schemas/schema';
import { eq, sql } from 'drizzle-orm';
import {
  NewWebhookEvent,
  PaymentStatus,
  subscriptionsPayments,
  WebhookEvent,
  webhookEvents,
} from 'src/modules/db/schemas/subscriptions/payments';
@Injectable()
export class PaymentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getUserStripeCustomerId(userId: string) {
    const user = await this.drizzleService.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        stripeCustomerId: true,
        fullName: true,
        email: true,
      },
    });

    return user;
  }

  async setUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    return this.drizzleService.db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId));
  }

  async createPaymentRecord(
    subscription,
    stripeInvoice,
    status: PaymentStatus,
    tx?,
  ) {
    const queryRunner = tx || this.drizzleService.db;
    return await queryRunner
      .insert(subscriptionsPayments)
      .values({
        subscriptionId: subscription.id,
        stripePaymentId: stripeInvoice.payment_intent as string,
        status,
        amount: stripeInvoice.amount_paid / 100, // Convert from cents
        currency: stripeInvoice.currency,
      })
      .returning({
        id: subscriptionsPayments.id,
        subscriptionId: subscriptionsPayments.subscriptionId,
      });
  }

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const result = await this.drizzleService.db
      .select({ count: sql<number>`count(*)` })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId));

    return result[0]?.count > 0;
  }

  async markWebhookAsProcessed(
    eventId: string,
    tx,
    eventType?: string,
    metadata?: Record<string, any>,
  ): Promise<WebhookEvent> {
    const newWebhook: NewWebhookEvent = {
      eventId,
      processedAt: new Date(),
      eventType,
      metadata,
    };
    const queryRunner = tx || this.drizzleService.db;
    const result = await queryRunner
      .insert(webhookEvents)
      .values(newWebhook)
      .returning();

    return result[0];
  }
}
