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
      // Get all countries from our database
      const countries = await this.commonRepository.getAllCountries();

      this.logger.log(`Starting city import for ${countries.length} countries`);

      // Process countries in batches to avoid overwhelming the API
      const batchSize = 3;
      for (let i = 0; i < countries.length; i += batchSize) {
        const batch = countries.slice(i, i + batchSize);
        await Promise.all(
          batch.map((country) => this.importCitiesForCountry(country)),
        );

        // Add a delay between batches to be nice to the API
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

      // Using REST Countries API to get country data including capital city
      const url = `https://restcountries.com/v3.1/alpha/${country.iso}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const countryData = response.data[0];

      // Start with capital city
      const cities: { name: string }[] = [];
      if (countryData.capital && countryData.capital.length > 0) {
        cities.push({ name: countryData.capital[0] });
      }

      // Get additional cities using public city API
      // Note: This API doesn't require an API key but has limited data
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
          // Take up to 50 cities to avoid overwhelming the database
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

      // Process each city
      const uniqueCities = Array.from(new Set(cities.map((c) => c.name))).map(
        (name) => ({ name }),
      );

      // Process cities in smaller batches to prevent translation API rate limiting
      const cityBatchSize = 10;
      for (let i = 0; i < uniqueCities.length; i += cityBatchSize) {
        const cityBatch = uniqueCities.slice(i, i + cityBatchSize);

        // Process each city in the batch
        await Promise.all(
          cityBatch.map(async (city) => {
            try {
              // Get English and Spanish names
              const nameEn = city.name;
              const nameES = await this.getSpanishTranslation(nameEn);

              // Store in database
              await this.commonRepository.insertCity({
                countryId: country.id,
                nameEn,
                nameES,
              });
            } catch (cityError) {
              this.logger.warn(
                `Failed to process city ${city.name}: ${cityError.message}`,
              );
            }
          }),
        );

        // Add a small delay between city batches
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

  /**
   * Gets Spanish translation for a city name using free translation API
   */
  private async getSpanishTranslation(cityName: string): Promise<string> {
    try {
      // Using the free itranslate.com API (no key required but limited)
      const url = 'https://api.mymemory.translated.net/get';
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: cityName,
            langpair: 'en|es',
          },
        }),
      );

      if (
        response.data.responseStatus === 200 &&
        response.data.responseData?.translatedText
      ) {
        return response.data.responseData.translatedText;
      }

      // Fallback - get Spanish name by appending common suffix patterns
      // This is a simplistic approach but can work for many English city names
      if (cityName.endsWith('on')) {
        return cityName.slice(0, -2) + 'ón';
      } else if (cityName.endsWith('burg')) {
        return cityName.slice(0, -4) + 'burgo';
      } else if (cityName.endsWith('ville')) {
        return cityName.slice(0, -5) + 'villa';
      } else if (cityName.endsWith('town')) {
        return cityName.slice(0, -4) + 'pueblo';
      }

      // If all else fails, just return the English name
      return cityName;
    } catch (error) {
      this.logger.warn(`Failed to translate city: ${cityName}`, error.message);
      // If translation fails, return the original name
      return cityName;
    }
  }
}
