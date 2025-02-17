import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { GroupMembersService } from './group-members.service';
  
  @Controller('groups')
  @UseGuards(JwtAuthGuard)
  export class GroupMembersController {
    constructor(private readonly groupMembersService: GroupMembersService) {}
  
    @Post(':groupId/members/:userId/join')
    async joinGroup(
      @Param('groupId') groupId: string,
      @Param('userId') userId: string,
    ) {
      return this.groupMembersService.joinGroup(userId, groupId);
    }
  
    @Delete(':groupId/members/:userId/leave')
    async leaveGroup(
      @Param('groupId') groupId: string,
      @Param('userId') userId: string,
    ) {
      return this.groupMembersService.leaveGroup(userId, groupId);
    }
  
    @Get(':groupId/members')
    async getGroupMembers(
      @Param('groupId') groupId: string,
    ) {
      return this.groupMembersService.getGroupMembers(groupId);
    }
  }