import { Injectable, NotFoundException } from '@nestjs/common';
import { ForumRepository } from './forum.repository';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { SQL } from 'drizzle-orm';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';
import { MediaType } from 'src/modules/db/schemas/posts/enums';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';

@Injectable()
export class ForumService {
  constructor(
    private readonly forumRepository: ForumRepository,
    private readonly queuesService: QueuesService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}
  async createPublication(
    data: { dto: CreateForumPublicationDto; files: any },
    authorId: string,
  ) {
    const { dto, files } = data;
    const topic = await this.forumRepository.findTopicById(dto.mainTopicId);
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    const newPublication = await this.forumRepository.createPublication(
      dto,
      authorId,
    );
    if (files) {
      const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
        files,
        'forum_publications',
      );
      await this.handlePublicationMedia(newPublication.id, uploadedFiles);
    }

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

  async handlePublicationMedia(
    publicationId: string,
    files: any,
  ): Promise<void> {
    const mediaEntries: {
      parentId: string;
      parentType: 'forum_publication';
      mediaUrl: string;
      mediaType: MediaType;
    }[] = [];
    const pushMedia = (file: any, mediaType: MediaType) => {
      mediaEntries.push({
        parentId: publicationId,
        parentType: 'forum_publication',
        mediaUrl: file.location,
        mediaType,
      });
    };

    files?.images?.forEach((file) => pushMedia(file, 'image'));
    files?.audio?.forEach((file) => pushMedia(file, 'audio'));
    files?.document?.forEach((file) => pushMedia(file, 'document'));

    if (mediaEntries.length) {
      await this.forumRepository.insertPublicationMedia(mediaEntries);
    }
  }
}
