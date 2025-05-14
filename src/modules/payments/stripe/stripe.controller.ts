import {
  Controller,
  Post,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { I18nService } from 'nestjs-i18n';

@Controller('')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private stripeService: StripeService,
    private stripeWebhookService: StripeWebhookService,
    private readonly i18n: I18nService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('payments.payments.errors.MISSING_STRIP_HEADER');
    }

    try {
      if (!req.rawBody) {
        throw new BadRequestException('payments.payments.errors.MISSING_RAW_BODY_IN_REQUEST');
      }

      const event = this.stripeService.constructEvent(signature, req.rawBody);
      await this.stripeWebhookService.handleEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw new BadRequestException(this.i18n.translate('payments.payments.errors.WEBHOOK_ERROR', {
          args: { message: error.message },
        }),);
    }
  }
}
