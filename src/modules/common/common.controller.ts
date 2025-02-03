import { Controller, Get } from '@nestjs/common';
import { CommonService } from './common.service';
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('topics')
  async getTopics() {
    return this.commonService.getTopics();
  }
}
