import { Injectable, NotFoundException } from '@nestjs/common';
import { ForumRepository } from './forum.repository';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { SQL } from 'drizzle-orm';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';

@Injectable()
export class ForumService {
  constructor(
    private readonly forumRepository: ForumRepository,
    private readonly queuesService: QueuesService,
  ) {}
  async createPublication(dto: CreateForumPublicationDto, authorId: string) {
    const topic = await this.forumRepository.findTopicById(dto.mainTopicId);
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    const newPublication = await this.forumRepository.createPublication(
      dto,
      authorId,
    );
    const action: Action = {
      id: newPublication.id,
      type: 'forum_publication',
    };
    this.queuesService.addPointsJob(authorId, dto.mainTopicId, action);
    return newPublication;
  }

  async getPublications(
    filter: {
      section: SQL<'need' | 'doubt' | 'dream'> | undefined;
      mainTopicId: number;
    },
    pagination: { limit: number; page: number },
    currentUserId: string,
  ) {
    const results = await this.forumRepository.getForumPublications(
      {
        section: filter.section,
        mainTopicId: filter.mainTopicId,
      },
      pagination,
      currentUserId,
    );

    return results;
  }

  async getPublication(publicationId: string) {
    const publication =
      await this.forumRepository.findPublicationById(publicationId);
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }
    return publication;
  }
}
