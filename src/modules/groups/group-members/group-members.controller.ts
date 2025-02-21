import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GroupMembersService } from './group-members.service';
import { UUID } from 'crypto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) { }

  @Post(':groupId/join')
  async joinGroup(@Param('groupId') groupId: string, @Req() req) {
    const userId: string = req.user.id
    return this.groupMembersService.joinGroup(userId, groupId);
  }

  @Delete(':groupId/leave')
  async leaveGroup(@Param('groupId') groupId: string, @Req() req) {
    const userId: string = req.user.id
    return this.groupMembersService.leaveGroup(userId, groupId);
  }

  @Get(':groupId/members')
  async getGroupMembers(@Param('groupId') groupId: string) {
    return this.groupMembersService.getGroupMembers(groupId);
  }
}