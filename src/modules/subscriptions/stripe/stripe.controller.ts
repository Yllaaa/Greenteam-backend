import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { IdParamDto } from "./dto/id-param.dto";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService
    ) { }

    @Get(':subscriptionId/create-payment-session')
    @UseGuards(JwtAuthGuard)
    async createPaymentSession(@Param() subscriptionId: IdParamDto, @Req() req) {
        return await this.stripeService.createStripeSession(subscriptionId.id, req.user);
    }

    @Get('webhook')
    async stripeWebhook(@Req() req) {
        return await this.stripeService.stripeWebhook(req.body, req.headers['stripe-signature']);
    }
}