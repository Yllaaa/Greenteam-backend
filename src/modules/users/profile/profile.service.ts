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
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';

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
