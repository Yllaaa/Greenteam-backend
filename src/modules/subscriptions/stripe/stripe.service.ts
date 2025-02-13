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
            price: amount
        });

        session.metadata = { paymentId: payment[0].id, user: user };
        return session;
    }

    async updatePaymentStatus(paymentId: string, status: StripePaymentStatus) {
        return await this.stripeRepository.updatePayment(paymentId, { status: status });
    }

    async confirmPayment(paymentMetadat: any) {
        const payment = await this.updatePaymentStatus(paymentMetadat.paymentId, StripePaymentStatus.Paid);
        await this.subService.setSubscriptionStateActive(payment[0].subscriptionId, paymentMetadat.user);
    }

    async stripeWebhook(body: any, signature: string) {
        const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
        const event = this.stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
        if (event.type === 'payment_intent.succeeded') {
            await this.confirmPayment(event.data.object.metadata.paymentId);
        }else if(event.type === 'payment_intent.payment_failed') {
            await this.updatePaymentStatus(event.data.object.metadata.paymentId, StripePaymentStatus.Failed);
        }
    }
}
