import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { DrizzleService } from '../../db/drizzle.service';
import { users } from '../../db/schemas/users/users';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private drizzle: DrizzleService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const savedUser = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        isEmailVerified: true,
      },
    });

    if (!savedUser?.isEmailVerified) {
      throw new UnauthorizedException('auth.auth.notifications.PLEASE_VERIFY_EMAIL');
    }

    request.user = savedUser;
    return true;
  }
}
