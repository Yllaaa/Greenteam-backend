import {
  Controller,
  Get,
  Query,
  Post,
  Param,
  HttpCode,
  HttpException,
  NotFoundException,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { PaginationDto } from './dto/paginations.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('liked-posts')
  async getLikedPosts(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.id;
    return await this.favoritesService.getUserLikedPosts(userId, paginationDto);
  }

  @Get('friends-posts')
  async getFriendsPosts(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.id;
    return await this.favoritesService.getUserFriendsPosts(
      userId,
      paginationDto,
    );
  }
  @Get('pages-posts')
  async getFollowedPagesPosts(
    @Query() paginationDto: PaginationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.favoritesService.getFollowedPagesPosts(
      userId,
      paginationDto,
    );
  }
  @Get('pages')
  async getFollowedPages(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.id;
    return await this.favoritesService.getFollowedPages(userId, paginationDto);
  }

  @Get('groups-posts')
  async getJoinedGroupsPosts(
    @Query() paginationDto: PaginationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.favoritesService.getJoinedGroupsPosts(
      userId,
      paginationDto,
    );
  }
  @Get('groups')
  async getJoinedGroups(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.id;
    return await this.favoritesService.getUserJoinedGroups(
      userId,
      paginationDto,
    );
  }

  @Get('events')
  async getJoinedEvents(@Query() paginationDto: PaginationDto, @Req() req) {
    const userId = req.user.id;
    return await this.favoritesService.getUserJoinedEvents(
      userId,
      paginationDto,
    );
  }

  @Get('products')
  async getFavoriteProducts() {
    // Logic to get all favourites
    return 'Get all favourites';
  }
}
