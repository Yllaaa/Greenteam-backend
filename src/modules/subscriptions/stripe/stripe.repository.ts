import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/modules/db/drizzle.service";
import { stripePayments } from "src/modules/db/schemas/schema";

@Injectable()
export class StripeRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ){ }

    async createPayment(payment: typeof stripePayments.$inferInsert){
        return await this.drizzleService.db.insert(stripePayments).values(payment).returning();
    }

    async updatePayment(paymentId: string, payment: Partial<typeof stripePayments.$inferInsert>) {
        return await this.drizzleService.db.update(stripePayments)
            .set(payment)
            .where(eq(stripePayments.paymentIntentId, paymentId))
            .returning();
    }
}