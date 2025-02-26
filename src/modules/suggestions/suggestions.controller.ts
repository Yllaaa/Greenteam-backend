import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { SuggestionsService } from './suggestions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
    constructor(
        private readonly suggestionsService: SuggestionsService
    ) { }

    @Get('pages')
    async getPagesSuggestions(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0;
        pagination.limit ||= 3;
        return await this.suggestionsService.getPagesSuggestions(
            req.user.id,
            pagination.offset,
            pagination.limit,
        );
    }

    @Get('groups')
    async getGroupsSuggestions(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0;
        pagination.limit ||= 3;
        return await this.suggestionsService.getGroupsSuggestions(
            req.user.id,
            pagination.offset,
            pagination.limit,
        );
    }

    @Get('followees')
    async getFolloweesSuggestions(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0;
        pagination.limit ||= 3;
        return await this.suggestionsService.getFolloweesSuggestions(
            req.user.id,
            pagination.offset,
            pagination.limit,
        );
    }

    @Get('friends')
    async getFriendsSuggestions(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0;
        pagination.limit ||= 3;
        return await this.suggestionsService.getFriendsSuggestions(
            req.user.id,
            pagination.offset,
            pagination.limit,
        );
    }
}
