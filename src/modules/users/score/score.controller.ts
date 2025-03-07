import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpException,
  Req,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('main-topics')
  async getMainTopicsScore(@Req() req) {
    const userId = req.user.id;
    return this.scoreService.getMainTopicsScore(userId);
  }

  @Get('sub-topics/:topicId')
  async getSubTopicsScore(@Req() req, @Param('topicId') topicId: number) {
    const userId = req.user.id;
    return this.scoreService.getSubTopicsScore(userId, topicId);
  }
}
