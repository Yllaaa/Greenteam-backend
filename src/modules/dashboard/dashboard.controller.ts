import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  StatsQueryDto,
  StatsResponseDto,
  TimePeriod,
} from './dto/stats-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query() query: StatsQueryDto): Promise<StatsResponseDto> {
    return this.dashboardService.getStats(query.period || TimePeriod.DAILY);
  }
}
