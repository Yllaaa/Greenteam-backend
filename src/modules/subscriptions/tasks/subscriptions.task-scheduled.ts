import { Injectable } from "@nestjs/common";
import { SubscriptionsRepository } from "../subscriptions.repository";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class SubscriptionsTaskScheduled {
    constructor(
        private readonly subRepository: SubscriptionsRepository
    ) {}

    @Cron("0 0 * * *")
    async updateSubscriptions() {
        const today = new Date();
        await this.subRepository.updateSubscriptionsToExpired(today);
    }
}