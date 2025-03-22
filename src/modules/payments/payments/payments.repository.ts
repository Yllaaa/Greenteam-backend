import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { users } from '../../db/schemas/schema';
import { eq } from 'drizzle-orm';
import {
  PaymentStatus,
  subscriptionsPayments,
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
  ) {
    return await this.drizzleService.db
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
      });
  }
}
