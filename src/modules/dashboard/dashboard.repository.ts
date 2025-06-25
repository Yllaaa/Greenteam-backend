import { Injectable } from '@nestjs/common';
import { TimePeriod } from './dto/stats-query.dto';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  posts,
  userReports,
  users,
  usersGreenChallenges,
} from 'src/modules/db/schemas/schema';

@Injectable()
export class DashboardRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  private getDateRangeCondition(table: any, period: TimePeriod) {
    const now = new Date();

    switch (period) {
      case TimePeriod.DAILY:
        return gte(
          table.joinedAt || table.createdAt,
          sql`date_trunc('day', now())`,
        );
      case TimePeriod.WEEKLY:
        return gte(
          table.joinedAt || table.createdAt,
          sql`date_trunc('week', now())`,
        );
      case TimePeriod.MONTHLY:
        return gte(
          table.joinedAt || table.createdAt,
          sql`date_trunc('month', now())`,
        );
      default:
        return gte(
          table.joinedAt || table.createdAt,
          sql`date_trunc('day', now())`,
        );
    }
  }

  private getPreviousPeriodCondition(table: any, period: TimePeriod) {
    const dateField = table.joinedAt || table.createdAt;

    switch (period) {
      case TimePeriod.DAILY:
        return and(
          gte(dateField, sql`date_trunc('day', now()) - interval '1 day'`),
          sql`${dateField} < date_trunc('day', now())`,
        );
      case TimePeriod.WEEKLY:
        return and(
          gte(dateField, sql`date_trunc('week', now()) - interval '1 week'`),
          sql`${dateField} < date_trunc('week', now())`,
        );
      case TimePeriod.MONTHLY:
        return and(
          gte(dateField, sql`date_trunc('month', now()) - interval '1 month'`),
          sql`${dateField} < date_trunc('month', now())`,
        );
      default:
        return and(
          gte(dateField, sql`date_trunc('day', now()) - interval '1 day'`),
          sql`${dateField} < date_trunc('day', now())`,
        );
    }
  }

  async getNewUsersCount(
    period: TimePeriod,
  ): Promise<{ current: number; previous: number }> {
    const currentResult = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(this.getDateRangeCondition(users, period));

    const previousResult = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(this.getPreviousPeriodCondition(users, period));

    return {
      current: currentResult[0]?.count || 0,
      previous: previousResult[0]?.count || 0,
    };
  }

  async getNewPostsCount(
    period: TimePeriod,
  ): Promise<{ current: number; previous: number }> {
    // Assuming posts table has a createdAt field. If not, modify accordingly
    const currentResult = await this.drizzleService.db
      .select({ count: count() })
      .from(posts)
      .where(this.getDateRangeCondition(posts, period));

    const previousResult = await this.drizzleService.db
      .select({ count: count() })
      .from(posts)
      .where(this.getPreviousPeriodCondition(posts, period));

    return {
      current: currentResult[0]?.count || 0,
      previous: previousResult[0]?.count || 0,
    };
  }

  async getReportsCount(
    period: TimePeriod,
  ): Promise<{ current: number; previous: number }> {
    // Assuming userReports table has a createdAt field. If not, modify accordingly
    const currentResult = await this.drizzleService.db
      .select({ count: count() })
      .from(userReports)
      .where(this.getDateRangeCondition(userReports, period));

    const previousResult = await this.drizzleService.db
      .select({ count: count() })
      .from(userReports)
      .where(this.getPreviousPeriodCondition(userReports, period));

    return {
      current: currentResult[0]?.count || 0,
      previous: previousResult[0]?.count || 0,
    };
  }

  async getCompletedChallengesCount(
    period: TimePeriod,
  ): Promise<{ current: number; previous: number }> {
    const currentResult = await this.drizzleService.db
      .select({ count: count() })
      .from(usersGreenChallenges)
      .where(
        and(
          eq(usersGreenChallenges.status, 'done'),
          this.getDateRangeCondition(usersGreenChallenges, period),
        ),
      );

    const previousResult = await this.drizzleService.db
      .select({ count: count() })
      .from(usersGreenChallenges)
      .where(
        and(
          eq(usersGreenChallenges.status, 'done'),
          this.getPreviousPeriodCondition(usersGreenChallenges, period),
        ),
      );

    return {
      current: currentResult[0]?.count || 0,
      previous: previousResult[0]?.count || 0,
    };
  }
}
