import { Controller, Get, Param, Post, RawBodyRequest, Req, UseGuards } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { IdParamDto } from "./dto/id-param.dto";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { Request } from "express";

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService
    ) { }

    @Get(':id/create-payment-session')
    @UseGuards(JwtAuthGuard)
    async createPaymentSession(@Param() subscriptionId: IdParamDto, @Req() req) {
        return await this.stripeService.createStripeSession(subscriptionId.id, req.user);
    }

    @Post('webhook')
    async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
        return await this.stripeService.stripeWebhook(req.rawBody, req.headers['stripe-signature'] as string);
    }
}