import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterGetPostsDto } from './dto/get-posts.dto';
import { FilterUserCommentsDto } from './dto/filter-comments.dto';
import { FollowersService } from '../followers/followers.service';
import { ValidateProfileImagesInterceptor } from 'src/modules/common/upload-media/interceptors/validate-profileImages.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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

  @Get('reacted-posts')
  async getLikedPosts(@Query() dto: FilterGetPostsDto, @Req() req) {
    const userId = req.user.id;
    return this.profileService.getUserReactedPosts(dto, userId);
  }

  @Get('commented-posts')
  async getUserCommentedPosts(@Query() dto: FilterUserCommentsDto, @Req() req) {
    const userId = req.user.id;
    return this.profileService.getUserComments(dto, userId);
  }
  @Get(':username/posts')
  async getPosts(
    @Query() dto: FilterGetPostsDto,
    @Req() req,
    @Param('username') username: string,
  ) {
    const userId = req.user.id;
    return this.profileService.getUserPosts(username, dto, userId);
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @UseInterceptors(ValidateProfileImagesInterceptor)
  async updateProfile(
    @Req() req,
    @Body()
    dto: UpdateProfileDto,
    @UploadedFiles()
    images: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const userId: string = req.user.id;
    return await this.profileService.updateProfile({ dto, images }, userId);
  }
}
