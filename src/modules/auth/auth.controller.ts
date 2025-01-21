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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 * 90,
      sameSite: 'lax',
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const response = await this.authService.register(registerDto);
    this.setAuthCookie(res, response?.accessToken);
    return res.json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const response = await this.authService.login(loginDto);
    this.setAuthCookie(res, response?.accessToken);
    return res.json(response);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const response = await this.authService.googleLogin(user);
    this.setAuthCookie(res, response?.accessToken);

    res.redirect(`${process.env.APP_URL}`);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }
}
