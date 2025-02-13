import { Injectable } from "@nestjs/common";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionState, SubscriptionType, subscriptionTypes } from "../db/schemas/schema";

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly subRepository: SubscriptionsRepository
    ) { }

    async createSubscription(subscriptionType: typeof subscriptionTypes.enumValues[number], user: any) {
        return await this.subRepository.createSubscription({
            userId: user.id,
            type: subscriptionType,
            state: subscriptionType == SubscriptionType.Volunteer ? SubscriptionState.Pending : SubscriptionState.NeedAproval,
            endDate: new Date()
        });
    }

    async getUserSubscriptions(userId: string) {
        return await this.subRepository.getUserSubscriptions(userId);
    }

    private async setSubscriptionState(subscriptionId: string, user: any, state: SubscriptionState) {
        return await this.subRepository.updateSubscription(subscriptionId, user.id, { state: state });
    }

    async setSubscriptionStateActive(subscriptionId: string, user: any) {
        return await this.setSubscriptionState(subscriptionId, user, SubscriptionState.Active);
    }

    async setSubscriptionStateCanceled(subscriptionId: string, user: any) {
        return await this.setSubscriptionState(subscriptionId, user, SubscriptionState.Canceled);
    }

}