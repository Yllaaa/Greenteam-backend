import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  db: NodePgDatabase<typeof schema>;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
