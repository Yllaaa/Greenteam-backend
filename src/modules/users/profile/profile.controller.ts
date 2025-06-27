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
import { GetAllProductsDto } from 'src/modules/marketplace/dtos/getAllProducts.dto';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { PaginationDto } from '../favorites/dto/paginations.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get(':username/posts')
  async getPosts(
    @Query() dto: FilterGetPostsDto,
    @Req() req,
    @Param('username') username: string,
  ) {
    const userId = req.user.id;
    const posts = await this.profileService.getUserPosts(username, dto, userId);
    return posts.map((post) => ({
      ...post,
      isAuthor: post.author?.id === userId,
    }));
  }

  @Get(':username/products')
  async getAllProducts(
    @Query() query: GetAllProductsDto,
    @Req() req,
    @Param('username') username: string,
  ) {
    const userId = req.user.id;
    const products = await this.profileService.getAllProducts(
      username,
      query,
      userId,
    );
    return products.map((product) => ({
      ...product,
      isAuthor: product.sellerId === userId,
    }));
  }

  @Get(':username/events')
  async getAllEvents(
    @Query() query: GetEventsDto,
    @Req() req,
    @Param('username') username: string,
  ) {
    const userId = req.user.id;
    const events = await this.profileService.getAllEvents(
      username,
      query,
      userId,
    );
    return events.map((event) => ({
      ...event,
      isAuthor: event.creatorId === userId,
    }));
  }

  @Get(':username/pages')
  async getUserOwnPages(
    @Req() req,
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    const userId: string = req.user.id;
    return await this.profileService.getUserPages(username, userId, pagination);
  }

  @Get(':username/groups')
  async getUserOwnGroups(
    @Req() req,
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    const userId: string = req.user.id;
    return await this.profileService.getUserGroups(
      username,
      userId,
      pagination,
    );
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
