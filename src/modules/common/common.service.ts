import { Injectable } from '@nestjs/common';
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
}
