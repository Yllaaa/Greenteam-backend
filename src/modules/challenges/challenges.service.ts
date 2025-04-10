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
import { CreatorType, UserChallengeStatus } from '../db/schemas/schema';
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

  async markDoPostAsDone(postId: string, userId: string) {
    const doPostChallenge = await this.challengesRepository.findDoPostChallenge(
      postId,
      userId,
    );
    if (!doPostChallenge) {
      throw new NotFoundException('Do post challenge not found');
    }

    if (doPostChallenge.status === 'done') {
      throw new BadRequestException(
        'Do post challenge is already marked as done',
      );
    }
    return await this.challengesRepository.UpdateDoPostChallengeStatus(
      postId,
      userId,
      'done',
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
    files: any,
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
      throw new BadRequestException(`you have already done this challenge`);
    }

    const creatorType = 'user' as CreatorType;

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

    const postData = {
      content,
      mainTopicId: topicId,
      creatorType: creatorType,
      subtopicIds: [],
    };
    await this.postsService.createPost(
      {
        createPostDto: postData,
        files,
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
