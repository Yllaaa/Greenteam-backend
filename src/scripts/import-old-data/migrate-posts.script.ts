import 'dotenv/config';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { posts, CreatorType } from 'src/modules/db/schemas/schema';

@Injectable()
class ImportPostsScript {
  constructor(private readonly drizzleService: DrizzleService) {}

  async run() {
    const db = this.drizzleService.db;

    console.log('🚀 Starting posts import...');

    // Load CSV
    const rows: any[] = await new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream('./Wo_Posts_with_header.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    console.log(`📦 Loaded ${rows.length} posts from CSV.`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const userId = Number(row.user_id);
        const pageId = Number(row.page_id);

        // Determine creator: user or page
        let creatorId: string | null = null;
        let creatorType: CreatorType = 'User' as CreatorType;

        if (pageId) {
          const page = await db.query.pages.findFirst({
            where: (p, { eq }) => eq(p.oldId, pageId),
          });
          if (page) {
            creatorId = page.id;
            creatorType = 'Page' as CreatorType;
          }
        }

        if (!creatorId && userId) {
          const user = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.oldId, userId),
          });
          if (user) {
            creatorId = user.id;
            creatorType = 'User' as CreatorType;
          }
        }

        if (!creatorId || !creatorType) {
          skipped++;
          continue;
        }

        // Convert seconds → Date
        const createdAt =
          row.posted && !isNaN(Number(row.posted))
            ? new Date(Number(row.posted) * 1000)
            : new Date();

        await db
          .insert(posts)
          .values({
            content: row.postText,
            mainTopicId: 1,
            creatorType,
            creatorId,
            createdAt,
          })
          .onConflictDoNothing();

        success++;
      } catch (err: any) {
        failed++;
        console.error(`❌ Failed to insert post ${row.id}:`, err.message);
      }
    }

    console.log(
      `✅ Done. Imported ${success} posts, skipped ${skipped}, failed ${failed}.`,
    );
  }
}

// Run standalone
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const importer = new ImportPostsScript(drizzleService);
  await importer.run();

  await drizzleService.onModuleDestroy();
})();
