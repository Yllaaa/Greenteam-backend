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
import { subscriptions, SubscriptionState } from '../../db/schemas/subscriptions/subscriptions';
import { Role } from 'src/modules/authorization/role.enum';

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
      console.log('JWT is not valid');
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const savedUser = await this.drizzle.db.query.users.findFirst({
      columns: {
        id: true,
        isEmailVerified: true,
        email: true,
        username: true,
        status: true,
      },
      where: eq(users.id, user.id),
      with: {
        subscriptions: {
          columns: {
            type: true
          },
          where: eq(subscriptions.state, SubscriptionState.Active)
        }
      }
    })

    if (!savedUser?.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    request.user = savedUser;
    request.user.roles = savedUser.subscriptions.map((subscription) => Role[subscription.type]);
    delete request.user.subscriptions
    return true;
  }
}
