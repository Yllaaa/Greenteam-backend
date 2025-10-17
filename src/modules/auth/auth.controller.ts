import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
  HttpException,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import { I18nService } from 'nestjs-i18n';
import { detectPlatform } from './utils/auth-utils';
import { AppleAuthGuard } from './guards/apple-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  private setAuthCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.greenteam.app',
      maxAge: 24 * 60 * 60 * 1000 * 90,
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const response = await this.authService.register(registerDto);
    this.setAuthCookie(res, response?.accessToken);
    const translatedMessage = await this.i18n.t(
      'auth.auth.validations.CHECK_YOUR_EMAIL',
    );
    res.json({
      message: translatedMessage,
      ...response,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const response = await this.authService.login(loginDto);
    this.setAuthCookie(res, response?.accessToken);
    res.json(response);
  }

  @Get('google/login')
  async googleAuth(
    @Req() req,
    @Res() res: Response,
    @Query('source') source?: string,
  ) {
    const state = Buffer.from(
      JSON.stringify({ source: source || 'web' }),
    ).toString('base64');

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.API_URL + '/api/v1/auth/google/callback')}` +
      `&response_type=code` +
      `&scope=email%20profile` +
      `&state=${state}`;

    return res.redirect(googleAuthUrl);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      const response = await this.authService.googleLogin(user);

      const state = req.query.state;
      let stateData: any = {};

      if (state) {
        try {
          stateData = JSON.parse(
            Buffer.from(state as string, 'base64').toString(),
          );
        } catch (error) {
          console.log('Failed to parse state:', error);
        }
      }

      const isMobileApp = stateData.source === 'mobile-app';
      const userAgent = req.headers['user-agent'] || '';
      const platform = detectPlatform(userAgent);

      let redirectUrl: string;

      if (isMobileApp && (platform === 'android' || platform === 'ios')) {
        redirectUrl = `${process.env.MOBILE_LINK}open?token=${response.accessToken}`;
      } else {
        redirectUrl = `${process.env.APP_URL}?token=${response.accessToken}`;
      }

      this.setAuthCookie(res, response.accessToken);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect(
        `${process.env.APP_URL}/auth/error?message=login_failed`,
      );
    }
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string, @Res() res: Response) {
    const response = await this.authService.verifyEmail(token);
    this.setAuthCookie(res, response?.accessToken);
    res.json(response);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    if (!email) {
      throw new HttpException(
        'auth.auth.validations.EMAIL_REQUIRED',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const platform = detectPlatform(userAgent);
    return this.authService.forgotPassword(forgotPasswordDto, platform);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const response = await this.authService.resetPassword(
      resetPasswordDto,
      token,
    );
    this.setAuthCookie(res, response?.accessToken);
    res.json(response);
  }
  @Get('apple/login')
  @UseGuards(AppleAuthGuard)
  async appleAuth() {}

  @Post('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      const response = await this.authService.appleLogin(user);

      const userAgent = req.headers['user-agent'] || '';
      const platform = detectPlatform(userAgent);

      let redirectUrl: string;

      if (platform === 'android' || platform === 'ios') {
        redirectUrl = `${process.env.MOBILE_LINK}open?token=${response.accessToken}`;
      } else {
        redirectUrl = `${process.env.APP_URL}?token=${response.accessToken}`;
      }

      this.setAuthCookie(res, response.accessToken);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Apple auth error:', error);
      return res.redirect(
        `${process.env.APP_URL}/auth/error?message=login_failed`,
      );
    }
  }
}
