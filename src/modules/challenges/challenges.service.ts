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
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class ChallengesService {
  constructor(
    private readonly challengesRepository: ChallengesRepository,
    private readonly postsService: PostsService,
    private readonly i18n: I18nService,
  ) {}

  async createDoPostChallenge(userId: string, postId: string) {
    const post = await this.challengesRepository.createDoPostChallenge(
      userId,
      postId,
    );
    return post;
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
      throw new NotFoundException(
        'challenges.challenges.errors.DO_POST_CHALLENGE_NOT_FOUND',
      );
    }

    if (doPostChallenge.status === 'done') {
      throw new BadRequestException(
        'challenges.challenges.validations.DO_POST_CHALLENGE_ALREADY_DONE',
      );
    }
    return await this.challengesRepository.UpdateDoPostChallengeStatus(
      postId,
      userId,
      'done',
    );
  }

  async deleteDoPost(postId: string, userId: string) {
    const doPostChallenge = await this.challengesRepository.findDoPostChallenge(
      postId,
      userId,
    );
    if (!doPostChallenge) {
      throw new NotFoundException(
        'challenges.challenges.errors.DO_POST_CHALLENGE_NOT_FOUND',
      );
    }
    return await this.challengesRepository.deleteDoPostChallenge(
      userId,
      postId,
    );
  }

  async addGreenChallengeToDo(userId: string, challengeId: string) {
    const challengeExists =
      await this.challengesRepository.findGreenChallengeById(challengeId);
    if (!challengeExists) {
      throw new NotFoundException(
        'challenges.challenges.errors.GREEN_CHALLENGE_NOT_FOUND',
      );
    }

    const userChallengeExists =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );
    if (userChallengeExists) {
      throw new BadRequestException(
        'challenges.challenges.validations.GREEN_CHALLENGE_ADDED_USER',
      );
    }

    await this.challengesRepository.addGreenChallengeToUser(
      userId,
      challengeId,
    );
    const translatedMessage = await this.i18n.t(
      'challenges.challenges.notifications.GREEN_CHALLENGE_ADDED_USER',
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: translatedMessage,
    };
  }

  async markGreenChallengeAsDone(userId: string, challengeId: string) {
    const userGreenChallenge =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );
    if (!userGreenChallenge) {
      throw new NotFoundException(
        'challenges.challenges.errors.USER_HAS_NOT_ADDED',
      );
    }

    if (userGreenChallenge.status === 'done') {
      throw new BadRequestException(
        'challenges.challenges.validations.GREEN_CHALLENGE_ALREADY_DONE',
      );
    }

    await this.challengesRepository.markGreenChallengeAsDone(
      userId,
      challengeId,
    );
    const translatedMessage = await this.i18n.t(
      'challenges.challenges.notifications.GREEN_CHALLENGE_MARKED_DONE',
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: translatedMessage,
    };
  }

  async postAboutCompletedDoPostChallenge(
    userId: string,
    postId: string,
    content: string,
    files: any,
  ) {
    console.log('postId', postId);
    const userDoPostChallenge =
      await this.challengesRepository.findDoPostChallenge(postId, userId);
    if (!userDoPostChallenge) {
      throw new NotFoundException(
        'challenges.challenges.errors.DO_POST_CHALLENGE_NOT_FOUND',
      );
    }

    if (userDoPostChallenge?.status === 'done') {
      throw new BadRequestException(
        `challenges.challenges.validations.ALREADY_DONE_CHALLENGE`,
      );
    }

    await this.challengesRepository.markDoPostChallengeAsDone(userId, postId);
    const creatorType = 'user' as CreatorType;
    const parentTopic = await this.challengesRepository.getParentTopic(
      userDoPostChallenge.post.mainTopicId,
    );
    const mainTopicId = parentTopic?.id || userDoPostChallenge.post.mainTopicId;
    const subTopicsIds = userDoPostChallenge.post.subTopics.map(
      (subTopic) => subTopic.topic.id,
    );
    const postData = {
      content,
      mainTopicId,
      creatorType: creatorType,
      subtopicIds: subTopicsIds,
    };
    await this.postsService.createPost(
      {
        createPostDto: postData,
        files,
      },
      userId,
    );

    const translatedMessage = await this.i18n.t(
      'pages.posts.notifications.POST_CREATED',
    );

    return {
      message: translatedMessage,
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
      throw new NotFoundException(
        'challenges.challenges.errors.GREEN_CHALLENGE_NOT_FOUND',
      );
    }

    const userGreenChallenge =
      await this.challengesRepository.findUserGreenChallenge(
        userId,
        challengeId,
      );

    if (userGreenChallenge?.status === 'done') {
      throw new BadRequestException(
        `challenges.challenges.validations.ALREADY_DONE_CHALLENGE`,
      );
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

    const translatedMessage = await this.i18n.t(
      'pages.posts.notifications.POST_CREATED',
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: translatedMessage,
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
      media: doPost.media,
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
