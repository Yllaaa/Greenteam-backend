import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      this.logger.error(`Error creating Stripe customer: ${error.message}`);
      throw error;
    }
  }

  async createProduct(
    name: string,
    description?: string,
  ): Promise<Stripe.Product> {
    try {
      return this.stripe.products.create({
        name,
        description,
      });
    } catch (error) {
      this.logger.error(`Error creating Stripe product: ${error.message}`);
      throw error;
    }
  }

  async createPrice(
    productId: string,
    amount: number,
    currency: string = 'usd',
    interval: Stripe.PriceCreateParams.Recurring.Interval = 'month',
  ): Promise<Stripe.Price> {
    try {
      return this.stripe.prices.create({
        product: productId,
        unit_amount: amount * 100, // Convert to cents
        currency,
        recurring: { interval },
      });
    } catch (error) {
      this.logger.error(`Error creating Stripe price: ${error.message}`);
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      this.logger.error(`Error creating Stripe subscription: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Error canceling Stripe subscription: ${error.message}`,
      );
      throw error;
    }
  }

  constructEvent(signature: string, payload: Buffer): Stripe.Event {
    try {
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret is not defined');
      }
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error(`Error constructing Stripe event: ${error.message}`);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      this.logger.error(`Error retrieving Stripe invoice: ${error.message}`);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Error retrieving Stripe subscription: ${error.message}`,
      );
      throw error;
    }
  }
}
