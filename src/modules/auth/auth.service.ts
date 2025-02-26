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
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import * as crypto from 'crypto';

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
      isEmailVerified: false,
      verificationToken,
    };

    await this.mailService.sendVerificationEmail(
      registerDto.email,
      verificationToken,
    );

    const createdUser = await this.authRepository.createUser(newUser);

    return this.generateToken(createdUser);
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    if (!identifier || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.validateUser(identifier, password);
    console.log(user);
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

  async getUserById(userId: string) {
    return await this.authRepository.getUserById(userId);
  }

  async googleLogin(profile: any) {
    let user = await this.authRepository.getUserByEmail(profile.email);

    if (!user) {
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

    return this.generateToken(user);
  }

  async validateJwtUser(userId: string) {
    const user = await this.authRepository.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
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
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  // verify email

  async verifyEmail(token: string) {
    const user = await this.authRepository.checkUserVerification(token);
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }
    const UpdatedUser = await this.authRepository.verifyEmail(user.id);
    const payload = {
      sub: UpdatedUser[0].id,
      email: UpdatedUser[0].email,
      username: UpdatedUser[0].username,
    };

    return {
      message: 'Email verified successfully',
      user: UpdatedUser,
      accessToken: this.jwtService.sign(payload),
    };
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

  // forgot password

  private generateResetToken(): { rawToken: string; hashedToken: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    return { rawToken, hashedToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.authRepository.getUserByEmail(
      forgotPasswordDto.email,
    );

    if (!user[0]) {
      return {
        message:
          'If your email is registered, you will receive a password reset link',
      };
    }

    const { rawToken, hashedToken } = this.generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000);

    try {
      await this.authRepository.forgotPassword(
        user[0].id,
        hashedToken,
        resetExpires,
      );
      await this.mailService.sendPasswordResetEmail(user[0].email, rawToken);

      return {
        message:
          'If your email is registered, you will receive a password reset link',
      };
    } catch (error) {
      await this.authRepository.forgotPassword(user[0].id, '', new Date(0));
      throw new Error('Failed to process password reset');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.authRepository.getUserByResetToken(hashedToken);

    if (!user[0]) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (
      user[0] &&
      user[0].passwordResetTokenExpires &&
      user[0].passwordResetTokenExpires < new Date()
    ) {
      await this.authRepository.forgotPassword(user[0].id, null, null);
      throw new UnauthorizedException('Reset token has expired');
    }

    const hashedPassword = await argon2.hash(resetPasswordDto.password);

    const updatedUser = await this.authRepository.resetPassword(
      user[0].id,
      hashedPassword,
    );

    const payload = {
      sub: updatedUser[0].id,
      email: updatedUser[0].email,
      username: updatedUser[0].username,
    };

    return {
      message: 'Password has been reset successfully',
      accessToken: this.jwtService.sign(payload),
    };
  }
}
