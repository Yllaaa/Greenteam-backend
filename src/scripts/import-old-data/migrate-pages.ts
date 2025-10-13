import 'dotenv/config';
import * as fs from 'fs';
import * as csv from 'csv-parser';

import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { PageCategoryType, pages } from 'src/modules/db/schemas/schema';

@Injectable()
class ImportPagesScript {
  constructor(private readonly drizzleService: DrizzleService) {}

  async run() {
    const db = this.drizzleService.db;

    console.log('🚀 Starting pages import...');

    const rows: any[] = await new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream('src/scripts/import-old-data/pages_backup.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    console.log(`📦 Loaded ${rows.length} pages from CSV.`);

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        // Convert seconds → JS Date
        const createdAt =
          row.time && !isNaN(Number(row.time))
            ? new Date(Number(row.time) * 1000)
            : new Date();

        // Find the user who owns this page (by oldId)
        const owner = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.oldId, Number(row.user_id)),
        });

        await db
          .insert(pages)
          .values({
            oldId: Number(row.page_id),
            ownerId: owner!.id,
            name: row.page_name?.trim(),
            description: row.page_description || '',
            slug: row.page_name?.toLowerCase().replace(/\s+/g, '-'),
            websiteUrl: row.website,
            category: 'Project' as PageCategoryType,
            why: row.company || '',
            how: row.address || '',
            what: row.call_action_type_url || '',
            countryId: 1,
            cityId: 1,
            createdAt,
          })
          .onConflictDoNothing();

        success++;
      } catch (error: any) {
        failed++;
        console.error(
          `❌ Failed to insert page ${row.page_id}:`,
          error.message,
        );
      }
    }

    console.log(`✅ Done. Imported ${success} pages, failed ${failed}.`);
  }
}

// Run it standalone
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const importer = new ImportPagesScript(drizzleService);
  await importer.run();

  await drizzleService.onModuleDestroy();
})();
