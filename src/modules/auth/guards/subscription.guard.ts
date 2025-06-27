import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBSCRIPTION_REQUIRED_KEY } from 'src/modules/subscriptions/decorator/subscription-required.decorator';
import { SubscriptionsService } from 'src/modules/subscriptions/subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSubscriptionRequired = this.reflector.getAllAndOverride<boolean>(
      SUBSCRIPTION_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!isSubscriptionRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasActiveSubscription =
      await this.subscriptionService.getUserSubscriptionByUserId(userId);

    if (!hasActiveSubscription) {
      throw new ForbiddenException(
        'You must have a subscription to access this feature.',
      );
    }

    return true;
  }
}
