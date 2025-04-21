import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { userBlocks, userReports } from '../../db/schemas/users/users-actions';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ActionsRepository {
    constructor(private readonly drizzle: DrizzleService) { }

    async createBlock(
        userId: string,
        blockedId: string,
        blockedEntityType: 'user' | 'page'
    ) {
        return await this.drizzle.db.insert(userBlocks).values({
            userId,
            blockedId,
            blockedEntityType,
        }).returning();
    }

    async findBlock(userId: string, blockedId: string) {
        return await this.drizzle.db.query.userBlocks.findFirst({
            where: and(
                eq(userBlocks.userId, userId),
                eq(userBlocks.blockedId, blockedId)
            ),
        });
    }

    async removeBlock(userId: string, blockedId: string) {
        return await this.drizzle.db
            .delete(userBlocks)
            .where(
                and(
                    eq(userBlocks.userId, userId),
                    eq(userBlocks.blockedId, blockedId)
                )
            )
            .returning();
    }

    async findAllBlocksByUser(userId: string) {
        return await this.drizzle.db.query.userBlocks.findMany({
            where: eq(userBlocks.userId, userId),
        });
    }

    // Add to existing action.repository.ts
    async createReport(
        userId: string,
        reportedId: string,
        reportedType: 'user' | 'page' | 'post' | 'group' | 'forum_publication' | 'comment' | 'product' | 'event',
        reason: string
    ) {
        return await this.drizzle.db.insert(userReports).values({
            userId,
            reportedId,
            reportedType,
            reason,
        }).returning();
    }

    async findReport(reportId: string) {
        return await this.drizzle.db.query.userReports.findFirst({
            where: eq(userReports.id, reportId),
        });
    }

    async findUserReports(userId: string) {
        return await this.drizzle.db.query.userReports.findMany({
            where: eq(userReports.userId, userId),
        });
    }

    async updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'ignored', adminNotes?: string) {
        const updateData: any = { status };
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }

        return await this.drizzle.db
            .update(userReports)
            .set(updateData)
            .where(eq(userReports.id, reportId))
            .returning();
    }

    async findAllReports() {
        return await this.drizzle.db.query.userReports.findMany({
            orderBy: (userReports, { desc }) => [desc(userReports.createdAt)],
        });
    }
}