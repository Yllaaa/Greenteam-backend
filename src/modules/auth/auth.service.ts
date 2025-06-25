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
import { UsersService } from '../users/users.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private userService: UsersService,
    private mailService: MailService,
    private readonly i18n: I18nService,
  ) {}

  async register(registerDto: RegisterDto) {
    const validUsernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!validUsernameRegex.test(registerDto.username)) {
      throw new BadRequestException(
        'auth.auth.validations.USERNAME_VALIDATION',
      );
    }
    const reservedUsernames = ['greenteam', 'admin', 'root'];
    if (reservedUsernames.includes(registerDto.username.toLowerCase())) {
      throw new BadRequestException(
        'auth.auth.validations.USERNAME_NOT_ALLOWED',
      );
    }

    const existingEmail = await this.authRepository.getUserByEmail(
      registerDto.email,
    );

    if (existingEmail) {
      throw new ConflictException('auth.auth.validations.EMAIL_IN_USE');
    }

    const existingUser = await this.authRepository.getUserByUsername(
      registerDto.username,
    );

    if (existingUser[0]) {
      console.log('existingUsername', existingUser[0]);
      throw new ConflictException('auth.auth.validations.USERNAME_IN_USE');
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

    const createdUser = (await this.authRepository.createUser(newUser))[0];
    return this.generateToken(createdUser);
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    if (!identifier || !password) {
      throw new UnauthorizedException(
        'auth.auth.validations.MISSING_EMAIL_OR_PASSWORD',
      );
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
    if (!user)
      throw new UnauthorizedException('auth.auth.errors.USER_NOT_FOUND');

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid)
      throw new UnauthorizedException(
        'auth.auth.errors.INVALID_EMAIL_OR_PASSWORD',
      );

    return user;
  }

  async getUserById(userId: string) {
    return await this.authRepository.getUserById(userId);
  }

  async googleLogin(profile: any) {
    try {
      let user = await this.authRepository.getUserByEmail(profile.email);
      if (user && (!user.googleId || !user.isEmailVerified)) {
        await this.userService.updateUserGoogleId(user.id, profile.googleId);
      }

      if (!user) {
        const baseUsername = profile.email.split('@')[0];
        const username = await this.generateUniqueUsername(baseUsername);

        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await argon2.hash(randomPassword);

        const newUser = {
          email: profile.email,
          fullName:
            profile.fullName ||
            profile.displayName ||
            profile.name ||
            'Google User',
          googleId: profile.googleId,
          username,
          password: hashedPassword,
          avatar: profile.picture || null,
          isEmailVerified: true,
        };

        const createdUsers = await this.authRepository.createUser(newUser);
        user = createdUsers[0];
      }

      const token = await this.generateToken(user);
      return token;
    } catch (error) {
      let errorMessage = 'Failed to authenticate with Google';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      throw new UnauthorizedException(
        this.i18n.translate('auth.auth.errors.GOOGLE_AUTHENTICATION_FAILED', {
          args: { errorMessage: errorMessage },
        }),
      );
    }
  }

  async validateJwtUser(userId: string) {
    const user = await this.authRepository.getUserById(userId);
    if (!user)
      throw new UnauthorizedException('auth.auth.errors.USER_NOT_FOUND');
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
      throw new UnauthorizedException(
        'auth.auth.errors.INVALID_VERIFICATION_TOKEN',
      );
    }
    const UpdatedUser = await this.authRepository.verifyEmail(user.id);
    const payload = {
      sub: UpdatedUser[0].id,
      email: UpdatedUser[0].email,
      username: UpdatedUser[0].username,
    };
    const translatedMessage = await this.i18n.t(
      'auth.auth.notifications.EMAIL_VERIFIED_SUCCESSFULLY',
    );

    return {
      message: translatedMessage,
      user: UpdatedUser,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.authRepository.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('auth.auth.errors.USER_NOT_FOUND');
    }

    if (user.isEmailVerified) {
      throw new ConflictException(
        'auth.auth.validations.EMAIL_ALREADY_VERIFIED',
      );
    }
    const verificationToken = uuidv4();

    await this.authRepository.resendVerificationEmail(email, verificationToken);

    await this.mailService.sendVerificationEmail(email, verificationToken);

    const translatedMessage = await this.i18n.t(
      'auth.auth.notifications.VERIFICATION_EMAIL_SENT',
    );

    return { message: translatedMessage };
  }

  // forgot password

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.authRepository.getUserByEmail(
      forgotPasswordDto.email,
    );

    const translatedMessage = await this.i18n.t(
      'auth.auth.notifications.SENT_PASSWORD_RESET_LINK',
    );

    if (!user) {
      return {
        message: translatedMessage,
      };
    }

    const { rawToken, hashedToken } = this.generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000);

    try {
      await this.authRepository.forgotPassword(
        user.id,
        hashedToken,
        resetExpires,
      );
      await this.mailService.sendPasswordResetEmail(user.email, rawToken);

      return {
        message: translatedMessage,
      };
    } catch (error) {
      await this.authRepository.forgotPassword(user.id, '', new Date(0));
      throw new Error('auth.auth.errors.FAILED_TO_RESET_PASSWORD');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.authRepository.getUserByResetToken(hashedToken);

    if (!user[0]) {
      throw new UnauthorizedException('auth.auth.errors.INVALID_RESET_TOKEN');
    }

    if (
      user[0] &&
      user[0].passwordResetTokenExpires &&
      user[0].passwordResetTokenExpires < new Date()
    ) {
      await this.authRepository.forgotPassword(user[0].id, null, null);
      throw new UnauthorizedException('auth.auth.errors.RESET_TOKEN_EXPIRED');
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
    const translatedMessage = await this.i18n.t(
      'auth.auth.notifications.PASSWORD_REST_SUCCESSFULLY',
    );

    return {
      message: translatedMessage,
      accessToken: this.jwtService.sign(payload),
    };
  }

  private generateResetToken(): { rawToken: string; hashedToken: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    return { rawToken, hashedToken };
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    const sanitizedBase = baseUsername
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 20);

    for (let counter = 0; counter < 5; counter++) {
      const usernameToTry =
        counter === 0 ? sanitizedBase : `${sanitizedBase}${counter}`;

      try {
        const existingUser = await Promise.race([
          this.authRepository.getUserByUsername(usernameToTry),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Username lookup timed out')),
              2000,
            ),
          ),
        ]);

        if (!existingUser) {
          return usernameToTry;
        }
      } catch (error) {
        console.error(`Error checking username ${usernameToTry}:`, error);
        break;
      }
    }

    const timestamp = Date.now().toString().slice(-6);
    return `${sanitizedBase}_${timestamp}`;
  }
}
