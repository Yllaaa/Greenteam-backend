import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.getUserByEmail(
      registerDto.email,
    );

    if (existingUser[0]) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(registerDto.username)) {
      throw new Error(
        'Username can only contain letters, numbers, and underscores',
      );
    }

    const newUser = {
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
    };

    await this.authRepository.createUser(newUser);

    return this.generateToken(newUser);
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    if (!identifier || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.validateUser(identifier, password);

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(identifier: string, password: string) {
    let user;

    const isEmail = identifier.includes('@');
    const field = isEmail ? 'email' : 'username';

    user = await this.authRepository.validateUser(field, identifier);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async googleLogin(profile: any) {
    let user = await this.authRepository.getUserByEmail(profile.email);

    if (!user[0]) {
      const newUser = {
        email: profile.email,
        fullName: profile.name,
        googleId: profile.googleId,
      };

      await this.authRepository.createUser(newUser);

      return this.generateToken(user[0]);
    }
  }
}
