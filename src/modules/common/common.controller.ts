import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('topics')
  async getTopics(@Query('mainTopics') mainTopics: boolean) {
    return this.commonService.getTopics(mainTopics);
  }
}
