import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterLikedPostsDto } from './dto/filter-liked-posts.dto';
import { FilterUserCommentsDto } from './dto/filter-comments.dto';
import { FollowersService } from '../followers/followers.service';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('pages')
  async getUserOwnPages(@Req() req) {
    const userId: string = req.user.id;
    return await this.profileService.getUserOwnPages(userId);
  }

  @Get('groups')
  async getUserOwnGroups(@Req() req) {
    const userId: string = req.user.id;
    return await this.profileService.getUserOwnGroups(userId);
  }

  @Get('posts')
  async getPosts(@Query() dto: FilterLikedPostsDto, @Req() req) {
    const userId = req.user.id;
    return this.profileService.getUserLikedDislikedPosts(dto, userId);
  }

  @Get('commented-posts')
  async getUserCommentedPosts(
    @Query(new ValidationPipe({ transform: true })) dto: FilterUserCommentsDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.profileService.getUserComments(dto, userId);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string, @Req() req) {
    const userId: string = req.user.id;
    return await this.profileService.getUserByUsername(username, userId);
  }

  @Post(':username/toggle-follow')
  async toggleFollow(
    @Param('username') username: string,
    @Req() req,
  ): Promise<{ following: boolean }> {
    const userId: string = req.user.id;
    return await this.profileService.toggleFollowUser(username, userId);
  }

  @Put('profile')
  async updateProfile(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateData: UpdateProfileDto,
  ) {
    const userId: string = req.user.id;
    return await this.profileService.updateProfile(userId, updateData);
  }
}
