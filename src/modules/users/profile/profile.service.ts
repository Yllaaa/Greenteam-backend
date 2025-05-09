import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { FilterUserCommentsDto } from './dto/filter-comments.dto';
import { FollowersService } from '../followers/followers.service';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { FilterGetPostsDto } from './dto/get-posts.dto';
import { GetAllProductsDto } from 'src/modules/marketplace/dtos/getAllProducts.dto';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { PaginationDto } from '../favorites/dto/paginations.dto';

@Injectable()
export class ProfileService {
  constructor(
    private profileRepository: ProfileRepository,
    private followersService: FollowersService,
    private uploadMediaService: UploadMediaService,
  ) {}

  async getUserByUsername(username: string, userId: string) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userData = await this.profileRepository.getUserProfile(
      user.id,
      userId,
    );

    const isMyProfile = userData?.id === userId;

    const userScore = isMyProfile
      ? await this.profileRepository.getUserScore(userData.id)
      : undefined;

    return {
      userData,
      userScore,
      isMyProfile,
    };
  }

  async updateProfile(
    data: { dto: UpdateProfileDto; images: any },
    userId: string,
  ) {
    const { dto, images } = data;
    const { avatar, cover } = images;

    if (dto.username) {
      const existingUser = await this.profileRepository.getUserByUsername(
        dto.username,
      );
      if (existingUser) {
        throw new BadRequestException(
          'Username already taken, please choose another one.',
        );
      }
    }
    let uploadedAvatar;
    if (avatar) {
      uploadedAvatar = await this.uploadMediaService.uploadSingleImage(
        avatar[0],
        'profiles',
      );
    }
    let uploadedCover;
    if (cover) {
      uploadedCover = await this.uploadMediaService.uploadSingleImage(
        cover[0],
        'profiles',
      );
    }

    const updateData = {
      ...dto,
      avatar: uploadedAvatar?.location,
      cover: uploadedCover?.location,
    };

    return await this.profileRepository.updateProfile(updateData, userId);
  }

  async getUserPosts(
    username: string,
    dto: FilterGetPostsDto,
    userId?: string,
  ) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const posts = await this.profileRepository.getUserPosts(
      user.id,
      { mainTopicId: dto.mainTopicId },
      {
        page: dto.page,
        limit: dto.limit,
      },
      userId,
    );

    return posts.map((post) => {
      return {
        ...post,
        isAuthor: post.author?.id === userId,
      };
    });
  }

  async getUserOwnPages(userId: string) {
    const pages = await this.profileRepository.getUserOwnPages(userId);
    return { pages };
  }

  async getUserOwnGroups(userId: string) {
    const groups = await this.profileRepository.getUserOwnGroups(userId);
    return { groups };
  }

  async getUserPages(
    username: string,
    userId: string,
    pagination: PaginationDto,
  ) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const pages = await this.profileRepository.getUserPages(
      user.id,
      userId,
      pagination,
    );
    return pages;
  }

  async getUserGroups(
    username: string,
    userId: string,
    pagination: PaginationDto,
  ) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const groups = await this.profileRepository.getUserGroups(
      user.id,
      userId,
      pagination,
    );
    return groups;
  }

  async getUserReactedPosts(dto: FilterGetPostsDto, userId: string) {
    return await this.profileRepository.getUserReactedPosts(
      userId,
      dto.mainTopicId,
      {
        page: dto.page,
        limit: dto.limit,
      },
    );
  }

  async getUserComments(dto: FilterUserCommentsDto, userId: string) {
    const posts = await this.profileRepository.getUserCommentedPosts(
      userId,
      dto.mainTopicId,
      {
        limit: dto.limit,
        page: dto.page,
      },
    );

    return posts;
  }
  async toggleFollowUser(username: string, userId: string) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.followersService.toggleFollow(userId, user.id);
  }

  async getAllProducts(
    username: string,
    query: GetAllProductsDto,
    userId: string,
  ) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const products = await this.profileRepository.getUserCreatedProducts(
      user.id,
      query,
      userId,
    );
    return products.map((product) => {
      return {
        ...product,
        isAuthor: product.sellerId === userId,
      };
    });
  }

  async getAllEvents(
    username: string,
    query: GetEventsDto,
    currentUserId: string,
  ) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const events = await this.profileRepository.getUserCreatedEvents(
      user.id,
      query,
      currentUserId,
    );
    return await Promise.all(
      events.map(async (event) => {
        const hostName = await this.GetEventHostName(event);
        console.log('hostName', hostName);
        const { userCreator, pageCreator, ...rest } = event;

        return {
          ...rest,
          hostName,
          isAuthor: event.creatorId === currentUserId,
        };
      }),
    );
  }

  private async GetEventHostName(event) {
    const hostedByStr = String(event.hostedBy);

    if (hostedByStr === 'Greenteam') {
      return 'Greenteam';
    } else if (hostedByStr === 'Global') {
      return 'Global';
    }

    return event?.userCreator?.fullName || 'community';
  }
}
