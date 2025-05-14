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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService
  ) {}

  private setAuthCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 * 90,
      sameSite: 'lax',
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const response = await this.authService.register(registerDto);
    this.setAuthCookie(res, response?.accessToken);
    const translatedMessage = await this.i18n.t('auth.auth.validations.CHECK_YOUR_EMAIL');
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
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;

      const response = await this.authService.googleLogin(user);

      this.setAuthCookie(res, response?.accessToken);

      res.redirect(`${process.env.APP_URL}?token=${response?.accessToken}`);
    } catch (error) {
      console.error('Google auth error:', error);
      res.redirect(`${process.env.APP_URL}/auth/error?message=login_failed`);
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
      throw new HttpException('auth.auth.validations.EMAIL_REQUIRED', HttpStatus.BAD_REQUEST);
    }
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
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
}
