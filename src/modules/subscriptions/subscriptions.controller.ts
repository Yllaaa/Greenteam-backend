import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionDto } from "./dto/subscription.dto";

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subService: SubscriptionsService
    ) { }

    @Get()
    async getSubscriptions(@Req() req) {
        return await this.subService.getUserSubscriptions(req.user);
    }

    @Post('create')
    async createSubscription(@Req() req, @Body() subscription: SubscriptionDto) {
        return await this.subService.createSubscription(subscription.type,req.user);
    }
}