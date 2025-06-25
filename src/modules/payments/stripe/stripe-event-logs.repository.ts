import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { stripeEventLogs } from 'src/modules/db/schemas/schema';

@Injectable()
export class StripeEventLogsRepository {
  constructor(private drizzleService: DrizzleService) {}

  async logEvent(params: {
    eventId: string;
    eventType: string;
    objectId?: string;
    objectType?: string;
    status?: string;
    rawData?: Record<string, any>;
    errorMessage?: string;
  }) {
    return this.drizzleService.db.insert(stripeEventLogs).values({
      eventId: params.eventId,
      eventType: params.eventType,
      objectId: params.objectId,
      objectType: params.objectType,
      status: params.status || 'received',
      rawData: params.rawData,
      errorMessage: params.errorMessage,
      createdAt: new Date(),
    });
  }

  async updateEventStatus(
    eventId: string,
    status: string,
    errorMessage?: string,
  ) {
    return this.drizzleService.db
      .update(stripeEventLogs)
      .set({
        status,
        errorMessage,
        processedAt: new Date(),
      })
      .where(eq(stripeEventLogs.eventId, eventId));
  }

  async getEventById(eventId: string) {
    return this.drizzleService.db
      .select()
      .from(stripeEventLogs)
      .where(eq(stripeEventLogs.eventId, eventId))
      .limit(1);
  }

  async getEventsByType(eventType: string, limit = 100) {
    return this.drizzleService.db
      .select()
      .from(stripeEventLogs)
      .where(eq(stripeEventLogs.eventType, eventType))
      .orderBy(desc(stripeEventLogs.createdAt))
      .limit(limit);
  }

  async getFailedEvents(limit = 100) {
    return this.drizzleService.db
      .select()
      .from(stripeEventLogs)
      .where(eq(stripeEventLogs.status, 'failed'))
      .orderBy(desc(stripeEventLogs.createdAt))
      .limit(limit);
  }
}
