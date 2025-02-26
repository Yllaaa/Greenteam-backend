import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../db/drizzle.service';
import { groups, groupMembers } from '../../db/schemas/schema';

@Injectable()
export class GroupMembersRepository {
    constructor(private drizzle: DrizzleService) { }

    async findGroup(groupId: string) {
        return this.drizzle.db.query.groups.findFirst({
            where: eq(groups.id, groupId),
        });
    }

    async findMembership(userId: string, groupId: string) {
        return this.drizzle.db.query.groupMembers.findFirst({
            where: and(
                eq(groupMembers.userId, userId),
                eq(groupMembers.groupId, groupId)
            ),
        });
    }

    async createMembership(userId: string, groupId: string) {
        return this.drizzle.db.insert(groupMembers).values({
            userId,
            groupId,
        });
    }

    async deleteMembership(userId: string, groupId: string) {
        return this.drizzle.db
            .delete(groupMembers)
            .where(
                and(
                    eq(groupMembers.userId, userId),
                    eq(groupMembers.groupId, groupId)
                )
            );
    }

    async findMembersByGroup(groupId: string) {
        return this.drizzle.db.query.groupMembers.findMany({
            where: eq(groupMembers.groupId, groupId),
            with: {
                user: true,
            },
        });
    }

    async isGroupMember(userId: string, groupId: string): Promise<boolean> {
        const membership = await this.drizzle.db.query.groupMembers.findFirst({
            where: and(
                eq(groupMembers.userId, userId),
                eq(groupMembers.groupId, groupId)
            ),
        });

        return !!membership;
    }
}