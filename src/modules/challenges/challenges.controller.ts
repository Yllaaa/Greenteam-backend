import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChallengesService } from './challenges.service';
import { GetDoPostsDto } from './dtos/get-do-posts.dto';
@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get('do-posts')
  async getUserDoPosts(@Query() pagination: GetDoPostsDto, @Req() req) {
    const userId = req.user.id;
    return this.challengesService.getUsersDoPosts(userId, pagination);
  }
}
