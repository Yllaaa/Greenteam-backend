import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ActionsRepository } from './action.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ActionsService {
  constructor(private readonly actionsRepository: ActionsRepository) {}
  private readonly i18n: I18nService
  async blockEntity(
    userId: string,
    blockedId: string,
    blockedEntityType: 'user' | 'page',
  ) {
    if (userId === blockedId && blockedEntityType === 'user') {
      throw new BadRequestException('users.actions.errors.BLOCK_YOURSELF');
    }

    try {
      const existingBlock = await this.actionsRepository.findBlock(
        userId,
        blockedId,
      );

      if (existingBlock) {
        throw new BadRequestException(
          this.i18n.translate('users.actions.validations.ALREADY_BLOCKED', {
            args: { blockedEntityType: blockedEntityType },
          }),
        );
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
      throw new BadRequestException('users.actions.errors.FAILED_TO_BLOCK');
    }
  }

  async unblockEntity(userId: string, blockedId: string) {
    const block = await this.actionsRepository.findBlock(userId, blockedId);

    if (!block) {
      throw new NotFoundException('users.actions.errors.BLOCK_NOT_FOUND');
    }

    return await this.actionsRepository.removeBlock(userId, blockedId);
  }

  async getUserBlocks(userId: string) {
    return await this.actionsRepository.findAllBlocksByUser(userId);
  }

  async reportEntity(
    userId: string,
    reportedId: string,
    reportedType:
      | 'user'
      | 'page'
      | 'post'
      | 'group'
      | 'forum_publication'
      | 'comment'
      | 'product'
      | 'event',
    reason: string,
  ) {
    try {
      return await this.actionsRepository.createReport(
        userId,
        reportedId,
        reportedType,
        reason,
      );
    } catch (error) {
      throw new BadRequestException('users.actions.errors.FAILED_TO_SUBMIT_REPORT');
    }
  }
}
