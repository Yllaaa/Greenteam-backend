import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionsTaskScheduled } from "./tasks/subscriptions.task-scheduled";

@Module({
  imports: [],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsRepository, SubscriptionsService, SubscriptionsTaskScheduled],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}