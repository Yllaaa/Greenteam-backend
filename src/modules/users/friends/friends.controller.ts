import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { IdParamDto } from './friend-requests/dto/id-param.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get()
    async getFriends(@Req() req) {
        return await this.friendsService.getFriends(req.user.id);
    }

    @Delete(':id/delete')
    async deleteFriend(@Param() friendId: IdParamDto, @Req() req) {
        return await this.friendsService.deleteFriend(friendId.id, req.user.id);
    }
}