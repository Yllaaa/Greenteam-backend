import { SetMetadata } from '@nestjs/common';

export const SUBSCRIPTION_REQUIRED_KEY = 'subscriptionRequired';
export const SubscriptionRequired = () =>
  SetMetadata(SUBSCRIPTION_REQUIRED_KEY, true);
