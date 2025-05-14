import {
  Controller,
  Body,
  Req,
  Get,
  HttpCode,
  HttpException,
  UseGuards,
  Post,
  Logger,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { I18nService } from 'nestjs-i18n';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly i18n: I18nService) {}
  private readonly logger = new Logger(SubscriptionsController.name);

  @Get('tiers')
  async getSubscriptionTiers() {
    try {
      return await this.subscriptionsService.getSubscriptionTiers();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('tiers/:tierId/subscribe')
  async createSubscription(@Req() req, @Param('tierId') tierId: number) {
    this.logger.log(`User ${req.user.id} is subscribing to tier ${tierId}`);
    return this.subscriptionsService.createSubscription(req.user.id, tierId);
  }

  @Get('my-subscription')
  async getMySubscription(@Req() req) {
    const subscription =
      await this.subscriptionsService.getUserActiveSubscription(req.user.id);
    if (!subscription) {
      throw new HttpException('subscriptions.subscriptions.errors.USER_HAS_NOT_ACTIVE_SUBSCRIPTION', 404);
    }
    return subscription;
  }

  // for testing only
  @Delete('delete-my-subscription')
  async deleteMySubscription(@Req() req) {
    await this.subscriptionsService.deleteUserSubscription(req.user.id);
    const translatedMessage = await this.i18n.t('subscriptions.subscriptions.notifications.SUBSCRIPTION_DELETED');
    return translatedMessage;
  }
}
