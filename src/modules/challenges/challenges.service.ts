import {
  Injectable,
  HttpCode,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ChallengesRepository } from './challenges.repository';
import { PostsService } from '../shared-modules/posts/posts/posts.service';
import { SQL } from 'drizzle-orm';
@Injectable()
export class ChallengesService {
  constructor(
    private readonly challengesRepository: ChallengesRepository,
    private readonly postsService: PostsService,
  ) {}

  async createDoPostChallenge(userId: string, postId: string) {
    return await this.challengesRepository.createDoPostChallenge(
      userId,
      postId,
    );
  }

  async deleteDoPostChallenge(userId: string, postId: string) {
    return await this.challengesRepository.deleteDoPostChallenge(
      userId,
      postId,
    );
  }

  async addGreenChallengeToDo(userId: string, challengeId: string) {
    const challengeExists =
      await this.challengesRepository.findGreenChallengeById(challengeId);
    if (!challengeExists) {
      throw new NotFoundException('Green challenge not found');
    }

    const userChallengeExists =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );
    if (userChallengeExists) {
      throw new BadRequestException('Green challenge already added to user');
    }

    await this.challengesRepository.addGreenChallengeToUser(
      userId,
      challengeId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Green challenge added to user',
    };
  }

  async markGreenChallengeAsDone(userId: string, challengeId: string) {
    const userGreenChallenge =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );
    if (!userGreenChallenge) {
      throw new NotFoundException('User has not added this challenge');
    }

    if (userGreenChallenge.status === 'done') {
      throw new BadRequestException(
        'Green challenge is already marked as done',
      );
    }

    await this.challengesRepository.markGreenChallengeAsDone(
      userId,
      challengeId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: ' Green challenge marked as done',
    };
  }

  async postAboutCompletedGreenChallenge(
    userId: string,
    challengeId: string,
    content: string,
  ) {
    const challenge =
      await this.challengesRepository.findGreenChallengeById(challengeId);
    if (!challenge) {
      throw new NotFoundException('Green challenge not found');
    }

    const userGreenChallenge =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );

    if (userGreenChallenge?.status === 'done') {
      throw new BadRequestException(
        `User has already completed this challenge with ID ${challengeId}`,
      );
    }

    const creatorType = 'user' as unknown as SQL<
      'user' | 'page' | 'group_member'
    >;
    if (!userGreenChallenge) {
      await this.challengesRepository.addGreenChallengeToUser(
        userId,
        challengeId,
        'done' as unknown as SQL<'pending' | 'done' | 'rejected'>,
      );
    } else {
      await this.challengesRepository.markGreenChallengeAsDone(
        userId,
        challengeId,
      );
    }

    const parentTopic = await this.challengesRepository.getParentTopic(
      challenge.topicId,
    );
    const topicId = parentTopic?.id || challenge.topicId;

    await this.postsService.createPost(
      {
        content,
        mainTopicId: topicId,
        creatorId: userId,
        creatorType: creatorType,
        subtopicIds: [],
      },
      userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Post created successfully',
    };
  }

  async getGreenChallenges(
    pagination: { page: number; limit: number },
    userId: string,
  ) {
    return await this.challengesRepository.getGreenChallenges(
      pagination,
      userId,
    );
  }

  async getUsersDoPosts(
    userId: string,
    pagination: { page: number; limit: number },
    topicId?: number,
  ) {
    const doPosts = await this.challengesRepository.getUsersDoPosts(
      userId,
      pagination,
      topicId,
    );
    return doPosts.map((doPost) => ({
      id: doPost.post.id,
      content: doPost.post.content,
      createdAt: doPost.post.createdAt,
      creator: {
        id: doPost.creator.id,
        name: doPost.creator.name,
        avatar: doPost.creator.avatar,
        username: doPost.creator.username,
      },
    }));
  }

  async getGreenChallengesToDoList(
    userId: string,
    pagination: { page: number; limit: number },
    topicId?: number,
  ) {
    const challenges =
      await this.challengesRepository.getUserGreenChallengesToDoList(
        userId,
        pagination,
        topicId,
      );
    return challenges.map((challenge) => ({
      id: challenge.challenge.id,
      title: challenge.challenge.title,
      description: challenge.challenge.description,
      expiresAt: challenge.challenge.expiresAt,
      topic: {
        id: challenge.topic.id,
        name: challenge.topic.name,
      },
    }));
  }
}
