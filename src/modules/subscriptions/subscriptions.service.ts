import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionState, SubscriptionType, subscriptionTypes } from "../db/schemas/schema";

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly subRepository: SubscriptionsRepository
    ) { }

    async getSubscriptionPrice(subscriptionId: string) {
        const sub = await this.subRepository.getSubscriptionById(subscriptionId);
        if(!sub) throw new NotFoundException();
        if(sub.state == SubscriptionState.NeedAproval ||
            sub.state == SubscriptionState.Canceled)
            throw new ForbiddenException();
        return (process.env[`SUBSCRIPTION_PRICE_${sub.type}`] || 0) as number;
    }

    async createSubscription(subscriptionType: typeof subscriptionTypes.enumValues[number], user: any) {
        return await this.subRepository.createSubscription({
            userId: user.id,
            type: subscriptionType,
            state: subscriptionType == SubscriptionType.Volunteer ? SubscriptionState.Pending : SubscriptionState.NeedAproval
        });
    }

    async getUserSubscriptions(user: any) {
        return await this.subRepository.getUserSubscriptions(user.id);
    }

    async setSubscriptionStateActive(subscriptionId: string, user: any) {
        const sub = await this.subRepository.getSubscriptionById(subscriptionId);
        if (!sub) throw new NotFoundException();
        if (sub.state != SubscriptionState.Active)
            sub.endDate = new Date()
        sub.endDate?.setMonth(sub.endDate?.getMonth() + 1)
        return await this.subRepository.updateSubscription(subscriptionId, user.id,
            {
                state: SubscriptionState.Active ,
                endDate: sub?.endDate
            });
    }

    async setSubscriptionStateCanceled(subscriptionId: string, user: any) {
        return await this.subRepository.updateSubscription(subscriptionId, user.id,
            {
                state: SubscriptionState.Canceled,
                endDate: new Date()
            });
    }

}