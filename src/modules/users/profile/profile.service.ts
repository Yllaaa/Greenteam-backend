import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterLikedPostsDto } from './dto/filter-liked-posts.dto';

@Injectable()
export class ProfileService {
    constructor(private profileRepository: ProfileRepository) { }

    async getUserByUsername(username: string, userId: string) {
        const user_data = await this.profileRepository.getUserByUsername(username)
        return {
            user_data,
            is_my_profile: user_data?.id === userId
        };
    }



    async updateProfile(userId: string, updateData: UpdateProfileDto) {
        const updatedUser = await this.profileRepository.updateProfile(userId, updateData);

        if (!updatedUser || updatedUser.length === 0) {
            throw new NotFoundException('User not found');
        }

        return {
            user: updatedUser[0]
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
            }
        );
    }
}
