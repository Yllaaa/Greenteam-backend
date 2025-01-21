import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { DrizzleService } from '../../db/drizzle.service';
import { users } from '../../db/schemas/users';
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

    const requiresVerification = this.reflector.getAllAndOverride<boolean>(
      'requiresVerification',
      [context.getHandler(), context.getClass()],
    );

    if (!requiresVerification) {
      return true;
    }

    const dbUser = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, user.sub))
      .limit(1);

    if (!dbUser[0]?.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    return true;
  }
}
