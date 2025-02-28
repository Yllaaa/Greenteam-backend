import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChallengesService } from './challenges.service';
import { Pagination } from './dtos/get-do-posts.dto';
@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get('do-posts')
  async getUserDoPosts(@Query() pagination: Pagination, @Req() req) {
    const userId = req.user.id;
    return this.challengesService.getUsersDoPosts(userId, pagination);
  }

  @Get('green-challenges')
  async getGreenChallenges(@Query() pagination: Pagination) {
    return this.challengesService.getGreenChallenges(pagination);
  }

  @Post('green-challenges/:id/add-to-do')
  async addGreenChallengeToUser(@Req() req, @Param('id') challengeId: string) {
    const userId = req.user.id;
    return this.challengesService.addGreenChallengeToUser(userId, challengeId);
  }
}
