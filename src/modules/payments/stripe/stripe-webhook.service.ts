import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsService } from '../payments/payments.service';
import { StripeEventLogsRepository } from './stripe-event-logs.repository';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private paymentsService: PaymentsService,
    private stripeEventLogsRepository: StripeEventLogsRepository,
  ) {}

  async handleEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    await this.stripeEventLogsRepository.logEvent({
      eventId: event.id,
      eventType: event.type,
      objectId: this.getObjectId(event),
      objectType: this.getObjectType(event),
      rawData: event.data.object as Record<string, any>,
    });

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

  private getObjectId(event: Stripe.Event): string | undefined {
    const object = event.data.object as any;
    return object.id;
  }

  private getObjectType(event: Stripe.Event): string | undefined {
    const object = event.data.object as any;
    return object.object;
  }
}
