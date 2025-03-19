import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(private paymentsService: PaymentsService) {}

  async handleEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event: ${error.message}`);
      throw error;
    }
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (invoice.subscription && invoice.id) {
      await this.paymentsService.handlePaymentSucceeded(
        invoice.subscription as string,
        invoice.id,
      );
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (invoice.subscription && invoice.id) {
      await this.paymentsService.handlePaymentFailed(
        invoice.subscription as string,
        invoice.id,
      );
    }
  }
}
