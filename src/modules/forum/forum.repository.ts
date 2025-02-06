import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { forumPublications } from '../db/schemas/schema';
import { CreateForumPublicationDto } from './dtos/create-forumPublication.dto';

@Injectable()
export class ForumRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createPublication(
    createDto: CreateForumPublicationDto,
    userId: string,
  ) {
    const publication = await this.drizzleService.db
      .insert(forumPublications)
      .values({
        headline: createDto.headline,
        content: createDto.content,
        mainTopicId: createDto.mainTopicId,
        authorId: userId,
        section: createDto.section,
      })
      .returning();

    return publication[0];
  }

  async findTopicById(topicId: string) {
    return this.drizzleService.db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.id, topicId),
    });
  }
}
