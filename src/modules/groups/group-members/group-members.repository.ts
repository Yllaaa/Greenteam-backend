import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../db/drizzle.service';
import { groups, groupMembers } from '../../db/schemas/schema';


@Injectable()
export class GroupMembersRepository {
    constructor(private drizzle: DrizzleService) { }

    async userJoinGroup(userId: string, groupId: string) {
        try {
            const group = await this.drizzle.db.query.groups.findFirst({
                where: eq(groups.id, groupId),
            });

            if (!group) {
                throw new NotFoundException('Group not found');
            }

            const existingMembership = await this.drizzle.db.query.groupMembers.findFirst({
                where: and(
                    eq(groupMembers.userId, userId),
                    eq(groupMembers.groupId, groupId)
                ),
            });

            if (existingMembership) {
                throw new ConflictException('User is already a member of this group');
            }

            await this.drizzle.db.insert(groupMembers).values({
                userId,
                groupId,
            });

            return { message: 'Successfully joined the group' };
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('Failed to join group');
        }
    }

    async userLeaveGroup(userId: string, groupId: string) {
        const result = await this.drizzle.db
            .delete(groupMembers)
            .where(
                and(
                    eq(groupMembers.userId, userId),
                    eq(groupMembers.groupId, groupId)
                )
            );

        if (!result) {
            throw new NotFoundException('Membership not found');
        }

        return { message: 'Successfully left the group' };
    }

    async getGroupMembers(groupId: string) {
        const members = await this.drizzle.db.query.groupMembers.findMany({
            where: eq(groupMembers.groupId, groupId),
            with: {
                user: true,
            },
        });

        return members;
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