// import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
// import { FriendRequestsService } from './friend-requests.service';
// import { IdParamDto } from './dto/id-param.dto';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { PaginationDto } from './dto/pagination.dto';

// @Controller('friend-requests')
// @UseGuards(JwtAuthGuard)
// export class FriendRequestsController {
//     constructor(
//         private readonly friendRequestsService: FriendRequestsService
//     ) { }

//     @Post()
//     async postFriendRequest(@Body() friend: IdParamDto, @Req() req) {
//         return await this.friendRequestsService.postFriendRequest(req.user.id, friend.id);
//     }

//     @Get()
//     async getFriendRequests(@Query() pagination: PaginationDto, @Req() req) {
//         pagination.offset ||= 0
//         pagination.limit ||= 10
//         return await this.friendRequestsService.getFriendRequests(req.user.id, pagination.offset, pagination.limit);
//     }

//     @Post(':id/accept')
//     async acceptFriendRequest(@Param() friendReq: IdParamDto, @Req() req) {
//         return await this.friendRequestsService.acceptFriendRequest(req.user.id, friendReq.id);
//     }

//     @Post(':id/decline')
//     async declineFriendRequest(@Param() friendReq: IdParamDto, @Req() req) {
//         return await this.friendRequestsService.declineFriendRequest(req.user.id, friendReq.id);
//     }

// }
