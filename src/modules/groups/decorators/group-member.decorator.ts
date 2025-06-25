import { applyDecorators, UseGuards } from '@nestjs/common';
import { GroupMemberGuard } from '../guards/group-member.guard';

export function RequireGroupMembership() {
  return applyDecorators(UseGuards(GroupMemberGuard));
}
