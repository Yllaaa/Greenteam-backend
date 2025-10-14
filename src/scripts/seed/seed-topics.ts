import 'dotenv/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { topics } from 'src/modules/db/schemas/schema';

class TopicSeedScript {
  private db: any;

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.db;
  }

  async run() {
    console.log('🚀 Starting topics seeding...');

    const filePath = path.join(
      __dirname,
      '../../data/topicsList.json', // adjust if needed
    );

    const rawData = await fs.readFile(filePath, 'utf-8');
    const topicData = JSON.parse(rawData);

    let success = 0;
    let failed = 0;

    for (const topic of topicData) {
      try {
        // Insert parent
        await this.db
          .insert(topics)
          .values({
            id: topic.id,
            name: topic.name,
          })
          .onConflictDoNothing();

        // Insert children
        if (Array.isArray(topic.subtopics)) {
          for (const sub of topic.subtopics) {
            await this.db
              .insert(topics)
              .values({
                id: sub.id,
                name: sub.name,
                parentId: topic.id,
              })
              .onConflictDoNothing();
          }
        }

        success++;
      } catch (error: any) {
        failed++;
        console.error(`❌ Failed to insert topic ${topic.id}:`, error.message);
      }
    }

    console.log(`✅ Done. Seeded ${success} parent topics, failed ${failed}.`);
  }
}

// Run standalone
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const seedScript = new TopicSeedScript(drizzleService);
  await seedScript.run();

  await drizzleService.onModuleDestroy();
})();
