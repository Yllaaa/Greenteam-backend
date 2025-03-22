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
   * Imports cities for all available countries
   */
  async importAllCities(): Promise<void> {
    try {
      const countries = await this.commonRepository.getAllCountries();
      this.logger.log(`Starting city import for ${countries.length} countries`);

      const batchSize = 3;
      for (let i = 0; i < countries.length; i += batchSize) {
        const batch = countries.slice(i, i + batchSize);
        await Promise.all(
          batch.map((country) => this.importCitiesForCountry(country)),
        );

        if (i + batchSize < countries.length) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      this.logger.log('City import completed successfully');
    } catch (error) {
      this.logger.error('Failed to import cities', error.stack);
      throw error;
    }
  }

  /**
   * Imports cities for a specific country
   */
  async importCitiesForCountry(country: {
    id: number;
    iso: string;
    nameEn: string;
  }): Promise<void> {
    try {
      this.logger.log(
        `Importing cities for country: ${country.iso} (${country.nameEn})`,
      );

      const url = `https://restcountries.com/v3.1/alpha/${country.iso}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const countryData = response.data[0];

      const cities: { name: string }[] = [];
      if (countryData.capital && countryData.capital.length > 0) {
        cities.push({ name: countryData.capital[0] });
      }

      try {
        const citiesResponse = await firstValueFrom(
          this.httpService.get(
            `https://countriesnow.space/api/v0.1/countries/cities/q?country=${country.nameEn}`,
          ),
        );

        if (
          citiesResponse.data.data &&
          Array.isArray(citiesResponse.data.data)
        ) {
          const additionalCities = citiesResponse.data.data
            .slice(0, 50)
            .map((cityName) => ({ name: cityName }));
          cities.push(...additionalCities);
        }
      } catch (err) {
        this.logger.warn(
          `Could not fetch additional cities for ${country.nameEn}: ${err.message}`,
        );
      }

      if (cities.length === 0) {
        this.logger.warn(`No cities found for country: ${country.iso}`);
        return;
      }

      const uniqueCities = Array.from(new Set(cities.map((c) => c.name))).map(
        (name) => ({ name }),
      );

      const cityBatchSize = 10;
      for (let i = 0; i < uniqueCities.length; i += cityBatchSize) {
        const cityBatch = uniqueCities.slice(i, i + cityBatchSize);

        await Promise.all(
          cityBatch.map(async (city) => {
            try {
              const nameEn = city.name;
              await this.commonRepository.insertCity({
                countryId: country.id,
                nameEn,
              });
            } catch (cityError) {
              this.logger.warn(
                `Failed to process city ${city.name}: ${cityError.message}`,
              );
            }
          }),
        );

        if (i + cityBatchSize < uniqueCities.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(
        `Successfully imported ${uniqueCities.length} cities for ${country.iso}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to import cities for country ${country.iso}`,
        error.message,
      );
    }
  }
}
