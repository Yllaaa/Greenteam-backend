import { Injectable } from "@nestjs/common";
import { DrizzleService } from "src/modules/db/drizzle.service";
import { and, eq } from 'drizzle-orm';
import { followees } from 'src/modules/db/schemas/users/followees/followees';

@Injectable()
export class FolloweesRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async addFollowee(userId: string, followeeId: string) {
        return await this.drizzleService.db.insert(followees).values({
            userId,
            followeeId
        }).returning();
    }

    async getFollowees(userId: string, offset: number, limit: number) {
        return await this.drizzleService.db.query.followees.findMany({
            where: eq(followees.userId, userId),
            columns: {
                followeeId: true
            },
            with: {
                followee: {
                    columns: {
                        id: true,
                        fullName: true,
                        avatar: true
                    }
                }
            },
            offset: offset,
            limit: limit
        })
    }

    async deleteFollowee(userId: string, followeeId: string) {
        return await this.drizzleService.db
            .delete(followees)
            .where(
                and(eq(followees.userId, userId), eq(followees.followeeId, followeeId))
            )
            .returning();
    }

}