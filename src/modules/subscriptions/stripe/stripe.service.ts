import { Injectable } from "@nestjs/common";
import { StripeRepository } from "./stripe.repository";
import { Stripe} from 'stripe'
import { SubscriptionsService } from "../subscriptions.service";
import { StripePaymentStatus } from "src/modules/db/schemas/schema";

@Injectable()
export class StripeService {
    private readonly stripe: Stripe

    constructor(
        private readonly stripeRepository: StripeRepository,
        private readonly subService: SubscriptionsService
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    }

    async createStripeSession(subscriptionId: string, user: any) {
        const amount = await this.subService.getSubscriptionPrice(subscriptionId);
        const session = await this.stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
            description: "Subscription Payment",
        });

        const payment = await this.stripeRepository.createPayment({
            paymentIntentId: session.id,
            subscriptionId: subscriptionId,
            userId: user.id,
        });

        return session;
    }

    async updatePaymentStatus(paymentId: string, status: StripePaymentStatus) {
        return await this.stripeRepository.updatePayment(paymentId, { status: status });
    }

    async confirmPayment(paymentId: string) {
        const payment = await this.updatePaymentStatus(paymentId, StripePaymentStatus.Paid);
        if (!payment[0]) return;
        await this.subService.setSubscriptionStateActive(payment[0].subscriptionId, {id: payment[0].userId});
    }

    async stripeWebhook(body: any, signature: string) {
        const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
        const event = this.stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
        if (event.type === 'payment_intent.succeeded') {
            const paymentId = (event.data.object as any).id;
            await this.confirmPayment(paymentId);
        }else if(event.type === 'payment_intent.payment_failed') {
            const paymentId = (event.data.object as any).id;
            await this.updatePaymentStatus(paymentId, StripePaymentStatus.Failed);
        }
    }
}
