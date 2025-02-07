import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/schema';
import { reset, seed } from 'drizzle-seed';

@Injectable()
export class DrizzleService implements OnApplicationBootstrap {
  db: NodePgDatabase<typeof schema>;

  async onApplicationBootstrap() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const client = await pool.connect();
    const db = drizzle(client, { schema });
    this.db = db;
    await this.seedData();
  }

  async seedData() {
    const topics = [
      'Cultivate',
      'Cook',
      'Keep',
      'Natural Medicine',
      'Nutrition',
      'Hygiene',
      'Ecotechnics and bioconstruction',
      'EcoDesign / Permaculture',
      'Water and energy',
      'Durable tools',
      'Knowledge and values',
      'Philosophy',
      'Astronomy',
      'Biology',
      'Geology',
      'History',
      'Psychology',
      'Culture',
      'Others'
    ];
    await reset(this.db, schema);
    await seed(this.db, schema).refine((f) => ({
      topics: {
        columns: {
          name: f.valuesFromArray({ values: topics, isUnique: true }),
        }
      },
      posts: {
        count: 100
      }
    }));
  }
}
