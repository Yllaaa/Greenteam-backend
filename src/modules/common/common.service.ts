import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonRepository } from './common.repository';
@Injectable()
export class CommonService {
  constructor(private readonly commonRepository: CommonRepository) {}
  async getTopics(mainTopics, query: { tree?: boolean }) {
    if (mainTopics) {
      return await this.commonRepository.getMainTopics();
    }
    return await this.commonRepository.getTopics(query);
  }

  async getAllCountries(locale: string) {
    const countries = await this.commonRepository.getAllCountries(locale);
    return countries.map((country) => {
      return {
        id: country.id,
        name: locale === 'es' ? country.nameES : country.nameEn,
        iso: country.iso,
      };
    });
  }

  async getCitiesForDropdown(params: {
    countryId: number;
    search?: string | undefined;
    limit?: number;
  }) {
    const result = await this.commonRepository.searchCitiesForDropdown(params);

    return result.map((city) => {
      return {
        id: city.id,
        name: city.nameEn,
      };
    });
  }
  async validateLocation(countryId: number, cityId: number) {
    if (countryId) {
      const exists = await this.commonRepository.countryExists(countryId);
      if (!exists) throw new BadRequestException('common.common.errors.INVALID_COUNTRY_ID');
    }

    if (cityId) {
      if (!countryId) {
        throw new BadRequestException(
          'common.common.validations.COUNTRY_ID_REQUIRED',
        );
      }
      const exists = await this.commonRepository.cityExistsInCountry(
        cityId,
        countryId,
      );
      if (!exists) {
        throw new BadRequestException(
          'common.common.errors.INVALID_DISTRICT',
        );
      }
    }
  }
}
