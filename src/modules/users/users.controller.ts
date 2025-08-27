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
  Delete,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.id;
    const user = await this.usersService.getMe(userId);
    return { user };
  }

  // for testing only remove on production
  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Req() req, @Res() res) {
    const userId = req.user.id;
    const user = await this.usersService.deleteUser(userId);
    if (!user) {
      throw new HttpException(
        'auth.auth.errors.USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    res.clearCookie('accessToken');
    return res.send();
  }

  @Put('deactivate')
  async deactivateUser(@Req() req, @Res() res) {
    const userId = req.user.id;
    const user = await this.usersService.deactivateUser(userId);
    if (!user) {
      throw new HttpException(
        'auth.auth.errors.USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    res.clearCookie('accessToken');
    return res.send({
      message: 'users.profile.notifications.USER_DEACTIVATED',
    });
  }
}
