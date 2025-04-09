import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupMembersService } from 'src/modules/groups/group-members/group-members.service';

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Assuming you have user data from authentication
    const groupId = request.params.groupId || request.body.groupId;

    if (!userId || !groupId) {
      return false;
    }

    const isMember = await this.groupMembersService.isGroupMember(
      userId,
      groupId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'You are not a member of this group, please join the group first',
      );
    }

    return true;
  }
}
