import { Module } from "@nestjs/common";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";
import { StripeRepository } from "./stripe.repository";
import { SubscriptionsModule } from "../subscriptions.module";

@Module({
  imports: [SubscriptionsModule],
  controllers: [StripeController],
  providers: [StripeService, StripeRepository],
  exports: [],
})
export class StripeModule {}