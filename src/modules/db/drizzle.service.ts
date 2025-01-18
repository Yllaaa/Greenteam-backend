import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/schema';

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
  }
}
