import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionDto } from "./dto/subscription.dto";
import { IdParamDto } from "./stripe/dto/id-param.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
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

    @Get(':id/cancel')
    async cancelSubscription(@Req() req, @Param() subscription: IdParamDto) {
        return await this.subService.setSubscriptionStateCanceled(subscription.id, req.user);
    }
}