import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';

import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { users } from 'src/modules/db/schemas/schema';

@Injectable()
class ImportUsersScript {
  constructor(private readonly drizzleService: DrizzleService) {}

  async run() {
    const db = this.drizzleService.db;

    console.log('🚀 Starting user import...');

    const rows: any[] = await new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream('./users_backup.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    console.log(`📦 Loaded ${rows.length} rows from CSV.`);

    const subset = rows
      .sort((a, b) => Number(a.id) - Number(b.id))
      .slice(0, 250);

    let success = 0;
    let failed = 0;

    for (const row of subset) {
      try {
        await db.insert(users).values({
          oldId: Number(row.user_id),
          email: row.email || `${row.username}@placeholder.com`,
          password: row.password || '',
          fullName: row.full_name || row.username,
          username: row.username || `user_${row.id}`,
          bio: row.about || null,
          phoneNumber: row.phone || null,
        });
        success++;
      } catch (error) {
        failed++;
        console.error(`❌ Failed to insert user ${row.id}:`, error.message);
      }
    }

    console.log(`✅ Done. Imported ${success} users, failed ${failed}.`);
  }
}

(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const importer = new ImportUsersScript(drizzleService);
  await importer.run();

  await drizzleService.onModuleDestroy();
})();
