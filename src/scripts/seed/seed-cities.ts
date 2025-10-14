import 'dotenv/config';
import axios from 'axios';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { countries, cities } from 'src/modules/db/schemas/schema';

class CityImportScript {
  private db: any;

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.db;
  }

  async run() {
    console.log('🚀 Starting city import...');

    try {
      // Load countries from DB
      const dbCountries = await this.db.select().from(countries);
      const countryMap = new Map(
        dbCountries.map((c: any) => [c.iso.toUpperCase(), c.id]),
      );

      console.log(`✅ Loaded ${dbCountries.length} countries from DB`);

      // Fetch all countries and cities from API
      const response = await axios.get(
        'https://countriesnow.space/api/v0.1/countries',
      );

      const apiCountries = response.data?.data;
      if (!apiCountries) {
        console.error('❌ Invalid API response format');
        return;
      }

      // Process each API country
      for (const apiCountry of apiCountries) {
        const iso2 = apiCountry.iso2?.toUpperCase();
        const countryId = countryMap.get(iso2);

        if (!countryId) {
          console.warn(`⚠️ No match for ISO2: ${iso2} (${apiCountry.country})`);
          continue;
        }

        // Remove duplicates
        const uniqueCities = Array.from(new Set(apiCountry.cities)).map(
          (name: string) => ({
            nameEn: name,
            countryId,
          }),
        );

        // Batch insert
        const batchSize = 10;
        for (let i = 0; i < uniqueCities.length; i += batchSize) {
          const batch = uniqueCities.slice(i, i + batchSize);
          for (const city of batch) {
            try {
              await this.db.insert(cities).values(city);
            } catch {
              // ignore duplicates
            }
          }
        }

        console.log(
          `✅ Inserted ${uniqueCities.length} cities for ${apiCountry.country}`,
        );
      }

      console.log('🎉 City import completed successfully');
    } catch (error: any) {
      console.error('❌ Failed to import cities:', error.message);
    }
  }
}

// Run script standalone
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const script = new CityImportScript(drizzleService);
  await script.run();

  await drizzleService.onModuleDestroy();
})();
