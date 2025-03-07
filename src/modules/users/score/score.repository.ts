import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { topics, userPoints } from 'src/modules/db/schemas/schema';

@Injectable()
export class ScoreRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getMainTopicsScore(userId: string) {
    const result = await this.drizzleService.db.execute(sql`
      WITH RECURSIVE 
topic_hierarchy AS (
    SELECT 
        id AS topic_id, 
        parent_id, 
        id AS root_id
    FROM topics
    
    UNION ALL
    
    SELECT 
        t.id AS topic_id, 
        t.parent_id, 
        th.root_id
    FROM topics t
    JOIN topic_hierarchy th ON t.parent_id = th.topic_id
),

user_topic_points AS (
    SELECT 
        topic_id, 
        SUM(points) AS total_points
    FROM user_points
    WHERE user_id = ${userId}
    GROUP BY topic_id
),

topic_scores AS (
    SELECT 
        th.root_id AS topic_id,
        SUM(COALESCE(utp.total_points, 0)) AS total_points
    FROM topic_hierarchy th
    LEFT JOIN user_topic_points utp ON th.topic_id = utp.topic_id
    GROUP BY th.root_id
)

-- Return only the main parent topics
SELECT 
    t.id AS topic_id,
    t.name AS topic_name,
    COALESCE(ts.total_points, 0) AS total_points
FROM topics t
JOIN topic_scores ts ON t.id = ts.topic_id
WHERE t.parent_id IS NULL  -- ✅ Ensures only parent topics are returned
ORDER BY ts.total_points DESC;

    `);

    return result.rows;
  }
}
