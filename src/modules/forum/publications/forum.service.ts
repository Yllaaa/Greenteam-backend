import { Injectable, NotFoundException } from '@nestjs/common';
import { ForumRepository } from './forum.repository';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';

@Injectable()
export class ForumService {
  constructor(private readonly forumRepository: ForumRepository) {}
  async createPublication(dto: CreateForumPublicationDto, authorId: string) {
    const topic = await this.forumRepository.findTopicById(dto.mainTopicId);
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return this.forumRepository.createPublication(dto, authorId);
  }

  async getPublications(
    filter: { section: ForumSection; mainTopicId: number },
    pagination: { limit: number; page: number },
  ) {
    const results = await this.forumRepository.getForumPublications(
      {
        section: filter.section,
        mainTopicId: filter.mainTopicId,
      },
      pagination,
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
