import { Body, Controller, Get, Param, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterLikedPostsDto } from './dto/filter-liked-posts.dto';
import { FilterUserCommentsDto } from './dto/filter-comments.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ProfileController {
    constructor(private profileService: ProfileService) { }

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

    @Get('comments')
    async getUserComments(
        @Query(new ValidationPipe({ transform: true })) dto: FilterUserCommentsDto,
        @Req() req
    ) {
        const userId = req.user.id;
        return this.profileService.getUserComments(dto, userId);
    }


    @Get(':username')
    async getUserByUsername(@Param('username') username: string, @Req() req) {
        const userId: string = req.user.id;
        return await this.profileService.getUserByUsername(username, userId);
    }


    @Put('me')
    async updateProfile(
        @Req() req,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateData: UpdateProfileDto
    ) {
        const userId: string = req.user.id;
        return await this.profileService.updateProfile(userId, updateData);
    }
}
