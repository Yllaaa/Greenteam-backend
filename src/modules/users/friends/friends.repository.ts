import { Injectable } from "@nestjs/common";
import { or, and, eq } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import { DrizzleService } from "src/modules/db/drizzle.service";
import { friends, users } from "src/modules/db/schemas/schema";

@Injectable()
export class FriendsRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }
    async getFriends(userId: string) {
        return await union(
            this.drizzleService.db.select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar
            }).from(friends)
                .where(eq(friends.userId, userId))
                .innerJoin(users, eq(friends.friendId, users.id)),
            this.drizzleService.db.select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar
            }).from(friends)
                .where(eq(friends.friendId, userId))
                .innerJoin(users, eq(friends.userId, users.id))
        )
    }

    async deleteFriend(userId: string, friendId: string) {
        return await this.drizzleService.db.delete(friends).where(
            or(
                and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
                and(eq(friends.userId, friendId), eq(friends.friendId, userId))
            )
        ).returning();
    }
}