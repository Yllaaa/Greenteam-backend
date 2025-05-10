import { Injectable } from '@nestjs/common';
import { StatItem, StatsResponseDto, TimePeriod } from './dto/stats-query.dto';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  }

  private getTimeLabel(period: TimePeriod): string {
    const now = new Date();

    switch (period) {
      case TimePeriod.DAILY:
        return `Stats for ${now.toLocaleDateString()}`;
      case TimePeriod.WEEKLY:
        return `Stats for this week`;
      case TimePeriod.MONTHLY:
        return `Stats for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
      default:
        return 'Current Stats';
    }
  }

  async getStats(period: TimePeriod): Promise<StatsResponseDto> {
    const [users, posts, reports, challenges] = await Promise.all([
      this.dashboardRepository.getNewUsersCount(period),
      this.dashboardRepository.getNewPostsCount(period),
      this.dashboardRepository.getReportsCount(period),
      this.dashboardRepository.getCompletedChallengesCount(period),
    ]);

    return {
      users: {
        label: 'Users',
        value: users.current,
        previousValue: users.previous,
        change: this.calculateChange(users.current, users.previous),
      },
      posts: {
        label: 'Posts',
        value: posts.current,
        previousValue: posts.previous,
        change: this.calculateChange(posts.current, posts.previous),
      },
      reports: {
        label: 'Reports',
        value: reports.current,
        previousValue: reports.previous,
        change: this.calculateChange(reports.current, reports.previous),
      },
      challenges: {
        label: 'Challenges',
        value: challenges.current,
        previousValue: challenges.previous,
        change: this.calculateChange(challenges.current, challenges.previous),
      },
      timeLabel: this.getTimeLabel(period),
    };
  }
}
