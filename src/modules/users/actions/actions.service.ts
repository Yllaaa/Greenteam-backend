import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { ActionsRepository } from './action.repository';

@Injectable()
export class ActionsService {
    constructor(private readonly actionsRepository: ActionsRepository) { }

    async blockEntity(
        userId: string,
        blockedId: string,
        blockedEntityType: 'user' | 'page',
    ) {
        // Prevent self-blocking
        if (userId === blockedId && blockedEntityType === 'user') {
            throw new BadRequestException('You cannot block yourself');
        }

        try {
            // Check if block already exists
            const existingBlock = await this.actionsRepository.findBlock(
                userId,
                blockedId,
            );

            if (existingBlock) {
                throw new BadRequestException('You have already blocked this entity');
            }

            return await this.actionsRepository.createBlock(
                userId,
                blockedId,
                blockedEntityType,
            );
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to block entity');
        }
    }

    async unblockEntity(userId: string, blockedId: string) {
        const block = await this.actionsRepository.findBlock(userId, blockedId);

        if (!block) {
            throw new NotFoundException('Block not found');
        }

        return await this.actionsRepository.removeBlock(userId, blockedId);
    }

    async getUserBlocks(userId: string) {
        return await this.actionsRepository.findAllBlocksByUser(userId);
    }

    async reportEntity(
        userId: string,
        reportedId: string,
        reportedType: 'user' | 'page' | 'post' | 'group' | 'forum_publication' | 'comment' | 'product' | 'event',
        reason: string
    ) {
        try {
            return await this.actionsRepository.createReport(
                userId,
                reportedId,
                reportedType,
                reason
            );
        } catch (error) {
            throw new BadRequestException('Failed to submit report');
        }
    }
}