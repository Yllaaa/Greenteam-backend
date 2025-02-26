import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { except, union } from "drizzle-orm/pg-core";
import { followees, friends, groupMembers, groups, pages, pagesFollowers, users } from "../db/schemas/schema";
import { eq, getTableColumns, or } from "drizzle-orm";

@Injectable()
export class SuggestionsRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async getPagesSuggestions(userId: string, offset: number, limit: number) {
        return await except(
            this.drizzleService.db.select().from(pages),
            this.drizzleService.db.select({ ...getTableColumns(pages) }).from(pages)
                .innerJoin(pagesFollowers, eq(pages.id, pagesFollowers.page_id))
                .where(eq(pagesFollowers.user_id, userId))
        ).offset(offset).limit(limit)
    }

    async getGroupsSuggestions(userId: string, offset: number, limit: number) {
        return await except(
            this.drizzleService.db.select().from(groups),
            this.drizzleService.db.select({ ...getTableColumns(groups) }).from(groups)
                .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
                .where(eq(groupMembers.userId, userId))
        ).offset(offset).limit(limit)
    }

    async getFolloweesSuggestions(userId: string, offset: number, limit: number) {
        return await except(
            this.drizzleService.db.select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar,
            }).from(users),
            this.drizzleService.db.select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar,
            }).from(users)
                .innerJoin(followees, eq(users.id, followees.followeeId))
                .where(eq(followees.userId, userId))
        ).offset(offset).limit(limit)
    }

    async getFriendsSuggestions(userId: string, offset: number, limit: number) {
        return await except(
            this.drizzleService.db.select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar,
            }).from(users),
            union(
                this.drizzleService.db.select({
                    id: users.id,
                    fullName: users.fullName,
                    avatar: users.avatar,
                }).from(users)
                    .innerJoin(friends, eq(users.id, friends.friendId))
                    .where(eq(friends.userId, userId)),
                this.drizzleService.db.select({
                    id: users.id,
                    fullName: users.fullName,
                    avatar: users.avatar,
                }).from(users)
                    .innerJoin(friends, eq(users.id, friends.userId))
                    .where(eq(friends.friendId, userId))
            )
        ).offset(offset).limit(limit)
    }
}