// src/stats/dto/stats-query.dto.ts
import { IsEnum, IsOptional } from 'class-validator';

export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class StatsQueryDto {
  @IsEnum(TimePeriod)
  @IsOptional()
  period: TimePeriod = TimePeriod.DAILY;
}

export interface StatItem {
  label: string;
  value: number;
  change?: number;
  previousValue?: number;
}

export class StatsResponseDto {
  users: StatItem;
  posts: StatItem;
  reports: StatItem;
  challenges: StatItem;
  timeLabel: string;
}
