import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/database/entities/users/users.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const savedUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: {
        id: true,
        isEmailVerified: true,
        email: true,
        username: true,
        status: true,
      },
    });

    if (!savedUser) {
      throw new UnauthorizedException('User not found');
    }

    if (!savedUser.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    request.user = savedUser;
    return true;
  }
}
