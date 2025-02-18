import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { IdParamDto } from './friend-requests/dto/id-param.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PaginationDto } from './friend-requests/dto/pagination.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get()
    async getFriends(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0
        pagination.limit ||= 10
        console.log(pagination)
        return await this.friendsService.getFriends(req.user.id, pagination.offset, pagination.limit);
    }

    @Delete(':id/delete')
    async deleteFriend(@Param() friendId: IdParamDto, @Req() req) {
        return await this.friendsService.deleteFriend(friendId.id, req.user.id);
    }
}