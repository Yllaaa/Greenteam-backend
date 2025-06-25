import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CommonRepository } from './common.repository';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CityImportService {
  private readonly logger = new Logger(CityImportService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly commonRepository: CommonRepository,
  ) {}

  /**
   * Imports cities for all available countries using iso2 mapping
   */
  async importAllCities(): Promise<void> {
    try {
      // Step 1: Fetch all countries from the database
      const countries = await this.commonRepository.getAllCountries();
      const countryMap = new Map(
        countries.map((c) => [c.iso.toUpperCase(), c.id]), // Use ISO2 as the key
      );

      this.logger.log(`Loaded ${countries.length} countries from DB`);

      // Step 2: Fetch all countries & cities from the API
      const response = await firstValueFrom(
        this.httpService.get('https://countriesnow.space/api/v0.1/countries'),
      );

      if (!response.data?.data) {
        this.logger.error('Invalid API response format');
        return;
      }

      const apiCountries = response.data.data;

      // Step 3: Process each country and insert cities
      for (const apiCountry of apiCountries) {
        const iso2 = apiCountry.iso2.toUpperCase();
        const countryId = countryMap.get(iso2);

        if (!countryId) {
          this.logger.warn(
            `No match found for ISO2: ${iso2} (${apiCountry.country})`,
          );
          continue;
        }

        // Step 4: Remove duplicates and prepare city data
        const uniqueCities = Array.from(new Set(apiCountry.cities)).map(
          (name: string) => ({
            name,
            countryId,
          }),
        );

        // Step 5: Insert cities in batches
        const batchSize = 10;
        for (let i = 0; i < uniqueCities.length; i += batchSize) {
          const batch = uniqueCities.slice(i, i + batchSize);
          await Promise.all(
            batch.map((city) =>
              this.commonRepository.insertCity({
                countryId: city.countryId,
                nameEn: city.name,
              }),
            ),
          );
        }

        this.logger.log(
          `Inserted ${uniqueCities.length} cities for country ${apiCountry.country} (ISO2: ${iso2})`,
        );
      }

      this.logger.log('City import completed successfully');
    } catch (error) {
      this.logger.error('Failed to import cities', error.stack);
      throw error;
    }
  }
}
