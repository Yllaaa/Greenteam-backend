import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { CityImportService } from './city-seed.service';
@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly cityImportService: CityImportService,
  ) {}

  @Get('topics')
  async getTopics(
    @Query('mainTopics') mainTopics: boolean,
    @Query('tree') tree: boolean,
  ) {
    return this.commonService.getTopics(mainTopics, { tree });
  }

  @Get('countries')
  async getCountries(@Query('locale') locale: string) {
    return this.commonService.getAllCountries(locale);
  }

  @Get('cities/import')
  async importCities() {
    return this.cityImportService.importAllCities();
  }
}
