import {
  Injectable,
  ExecutionContext,
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
    const savedUser = await this.drizzle.db
      .select({
        id: users.id,
        isEmailVerified: users.isEmailVerified,
        email: users.email,
        username: users.username,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!savedUser[0]?.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    request.user = savedUser[0];
    return true;
  }
}
