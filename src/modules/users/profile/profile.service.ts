import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterLikedPostsDto } from './dto/filter-liked-posts.dto';
import { FilterUserCommentsDto } from './dto/filter-comments.dto';
import { FollowersService } from '../followers/followers.service';

@Injectable()
export class ProfileService {
  constructor(
    private profileRepository: ProfileRepository,
    private followersService: FollowersService,
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

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const updatedUser = await this.profileRepository.updateProfile(
      userId,
      updateData,
    );
    if (!updatedUser || updatedUser.length === 0) {
      throw new NotFoundException('User not found');
    }
    return {
      user: updatedUser[0],
    };
  }

  async getUserOwnPages(userId: string) {
    const pages = await this.profileRepository.getUserOwnPages(userId);
    return { pages };
  }

  async getUserOwnGroups(userId: string) {
    const groups = await this.profileRepository.getUserOwnGroups(userId);
    return { groups };
  }

  async getUserLikedDislikedPosts(dto: FilterLikedPostsDto, userId: string) {
    return await this.profileRepository.getUserLikedDislikedPosts(
      userId,
      dto.mainTopicId,
      {
        page: dto.page,
        limit: dto.limit,
      },
    );
  }

  async getUserComments(dto: FilterUserCommentsDto, userId: string) {
    const result = await this.profileRepository.getUserCommentedPosts(
      userId,
      {
        mainTopicId: dto.mainTopicId,
        subTopicId: dto.subTopicId,
      },
      {
        limit: dto.limit,
        page: dto.page,
      },
    );

    return {
      items: result,
    };
  }
  async toggleFollowUser(username: string, userId: string) {
    const user = await this.profileRepository.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.followersService.toggleFollow(user.id, userId);
  }
}
