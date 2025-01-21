import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { MailService } from '../common/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const validUsernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!validUsernameRegex.test(registerDto.username)) {
      throw new BadRequestException(
        'Username must be 3-30 characters long and can only contain letters, numbers, and underscores',
      );
    }
    const reservedUsernames = ['greenteam', 'admin', 'root'];
    if (reservedUsernames.includes(registerDto.username.toLowerCase())) {
      throw new BadRequestException('Username is not allowed');
    }

    const existingEmail = await this.authRepository.getUserByEmail(
      registerDto.email,
    );

    if (existingEmail[0]) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.authRepository.getUserByUsername(
      registerDto.username,
    );

    if (existingUsername[0]) {
      throw new ConflictException('Username already in use');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const verificationToken = uuidv4();

    const newUser = {
      id: uuidv4(),
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
      isVerified: false,
      verificationToken,
    };

    await this.mailService.sendVerificationEmail(
      registerDto.email,
      verificationToken,
    );

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
        fullName: profile.fullName,
        googleId: profile.googleId,
        password: await argon2.hash(profile.id + process.env.SECRET),
        avatar: profile.picture,
        isEmailVerified: true,
      };

      user = await this.authRepository.createUser(newUser);
    }

    return this.generateToken(user[0]);
  }

  async validateJwtUser(userId: string) {
    const user = await this.authRepository.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser = { id: user.id, email: user.email };
    return currentUser;
  }

  generateToken(user: any) {
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
      accessToken: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(token: string) {
    const user = await this.authRepository.checkUserVerification(token);
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }
    const UpdatedUser = await this.authRepository.verifyEmail(user.id);
    return { message: 'Email verified successfully', user: UpdatedUser };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.authRepository.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user[0].isEmailVerified) {
      throw new ConflictException('Email already verified');
    }
    const verificationToken = uuidv4();

    await this.authRepository.resendVerificationEmail(email, verificationToken);

    await this.mailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verification email sent' };
  }
}
