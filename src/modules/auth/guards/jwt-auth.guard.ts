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
    console.log('JwtAuthGuard');
    const isJwtValid = await super.canActivate(context);
    console.log(isJwtValid);

    if (!isJwtValid) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);

    const savedUser = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        isEmailVerified: true,
        status: true,
      },
    });

    this.validateUser(savedUser);

    request.user = savedUser;
    return true;
  }

  private validateUser(user: any): void {
    if (!user) {
      throw new UnauthorizedException('auth.auth.errors.USER_NOT_FOUND');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'auth.auth.notifications.PLEASE_VERIFY_EMAIL',
      );
    }

    const statusErrors: Record<string, Error> = {
      BANNED: new ForbiddenException('auth.auth.errors.USER_BANNED'),
      DEACTIVATED: new ForbiddenException('auth.auth.errors.USER_DEACTIVATED'),
    };

    if (statusErrors[user.status]) {
      throw statusErrors[user.status];
    }
  }
}
