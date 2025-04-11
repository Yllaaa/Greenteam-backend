import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Req,
  UseGuards,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChallengesService } from './challenges.service';
import { UserChallengesDto } from './dtos/get-do-posts.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ValidateMediaInterceptor } from '../common/upload-media/interceptors/validateMedia.interceptor';
import { GreenChallengePostDto } from './dtos/create-challenge-post.dto';

@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get('do-posts')
  async getUserDoPosts(
    @Query() userChallengesDto: UserChallengesDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.challengesService.getUsersDoPosts(
      userId,
      userChallengesDto,
      userChallengesDto.topicId,
    );
  }

  @Put('do-posts/:id/mark-as-done')
  async markDoPostAsDone(@Req() req, @Param('id') postId: string) {
    const userId = req.user.id;
    await this.challengesService.markDoPostAsDone(postId, userId);
    return { message: 'Do post marked as done' };
  }

  @Get('green-challenges')
  async getGreenChallenges(
    @Query() userChallengesDto: UserChallengesDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.challengesService.getGreenChallenges(
      { limit: userChallengesDto.limit, page: userChallengesDto.page },
      userId,
    );
  }

  @Get('green-challenges/todo-list')
  async getGreenChallengesToDoList(
    @Query() userChallengesDto: UserChallengesDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.challengesService.getGreenChallengesToDoList(
      userId,
      { page: userChallengesDto.page, limit: userChallengesDto.limit },
      userChallengesDto.topicId,
    );
  }

  @Post('green-challenges/:id/add-to-do')
  async addGreenChallengeToUser(@Req() req, @Param('id') challengeId: string) {
    const userId = req.user.id;
    return this.challengesService.addGreenChallengeToDo(userId, challengeId);
  }

  @Post('green-challenges/:id/mark-as-done')
  async markGreenChallengeAsDone(@Req() req, @Param('id') challengeId: string) {
    const userId = req.user.id;
    return this.challengesService.markGreenChallengeAsDone(userId, challengeId);
  }

  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  @Post('green-challenges/:id/done-with-post')
  async createDoPostChallenge(
    @Req() req,
    @Param('id') challengeId: string,
    @Body() dto: GreenChallengePostDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.id;
    return this.challengesService.postAboutCompletedGreenChallenge(
      userId,
      challengeId,
      dto.content,
      files,
    );
  }
}
