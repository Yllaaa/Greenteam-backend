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

    let parentSuccess = 0;
    let childSuccess = 0;
    let failed = 0;

    // 1️⃣ Insert parent topics first
    for (const topic of topicData) {
      try {
        await this.db
          .insert(topics)
          .values({
            id: topic.id, // only if you REALLY want fixed ids
            name: topic.name,
            parentId: null, // ensure no FK error
          })
          .onConflictDoNothing();

        parentSuccess++;
      } catch (error: any) {
        failed++;
        console.error(
          `❌ Failed to insert parent topic ${topic.id}:`,
          error.message,
        );
      }
    }

    // 2️⃣ Insert subtopics with valid parentId now guaranteed
    for (const topic of topicData) {
      if (Array.isArray(topic.subtopics)) {
        for (const sub of topic.subtopics) {
          try {
            await this.db
              .insert(topics)
              .values({
                id: sub.id,
                name: sub.name,
                parentId: topic.id, // parent is now ensured
              })
              .onConflictDoNothing();

            childSuccess++;
          } catch (error: any) {
            failed++;
            console.error(
              `❌ Failed to insert subtopic ${sub.id} (parent ${topic.id}):`,
              error.message,
            );
          }
        }
      }
    }

    console.log(
      `✅ Done. Seeded ${parentSuccess} parents, ${childSuccess} children, failed ${failed}.`,
    );
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
