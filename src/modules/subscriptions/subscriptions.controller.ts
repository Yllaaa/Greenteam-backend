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

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
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
      throw new HttpException('User does not have an active subscription', 404);
    }
    return subscription;
  }

  // for testing only
  @Delete('delete-my-subscription')
  async deleteMySubscription(@Req() req) {
    await this.subscriptionsService.deleteUserSubscription(req.user.id);
    return 'Subscription deleted';
  }
}
