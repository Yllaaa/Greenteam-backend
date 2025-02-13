import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { subscriptions, SubscriptionState } from "../db/schemas/schema";
import { and, eq, lt } from "drizzle-orm";

@Injectable()
export class SubscriptionsRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async getSubscriptionById(subscriptionId: string) {
        return await this.drizzleService.db.query.subscriptions.findFirst({
            where: eq(subscriptions.id, subscriptionId),
        });
    }

    async getUserActiveSubscriptions(userId: string) {
        return await this.drizzleService.db.query.subscriptions.findMany({
            where: and(eq(subscriptions.userId, userId), eq(subscriptions.state, SubscriptionState.Active)),
        })
    }

    async getUserSubscriptions(userId: string) {
        return await this.drizzleService.db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, userId),
        });
    }

    async createSubscription(subscription: typeof subscriptions.$inferInsert) {
        return await this.drizzleService.db.insert(subscriptions).values(subscription).returning();
    }

    async updateSubscription(subscriptionId: string, userId: string, subscription: Partial<typeof subscriptions.$inferInsert>) {
        return await this.drizzleService.db.update(subscriptions)
            .set(subscription)
            .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)))
            .returning();
    }

    async updateSubscriptionsToExpired(date: Date) {
        return await this.drizzleService.db.update(subscriptions)
            .set({ state: SubscriptionState.Expired })
            .where(and(lt(subscriptions.endDate, date), eq(subscriptions.state, SubscriptionState.Active)))
            .returning();
    }
}