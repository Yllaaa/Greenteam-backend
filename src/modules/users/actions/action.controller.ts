import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Get,
  Req,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ActionsService } from './actions.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('')
@UseGuards(JwtAuthGuard)
export class ActionsController {
  constructor(
    private readonly actionsService: ActionsService,
    private readonly i18n: I18nService
  ) {}

  @Post('block')
  async blockEntity(@Req() req, @Body() createBlockDto: CreateBlockDto) {
    const userId: string = req.user.id;
    return await this.actionsService.blockEntity(
      userId,
      createBlockDto.blockedId,
      createBlockDto.blockedEntityType,
    );
  }

  @Delete('unblock')
  async unblockEntity(@Req() req, @Body('blockedId') blockedId: string) {
    const userId: string = req.user.id;
    const result = await this.actionsService.unblockEntity(userId, blockedId);
    if (!result) {
      throw new NotFoundException('users.actions.errors.BLOCK_NOT_FOUND');
    }
    const translatedMessage = await this.i18n.t('users.actions.notifications.UN_BLOCKED_SUCCESSFULLY');
    return { message: translatedMessage };
  }

  @Get('blocks')
  async getUserBlocks(@Req() req) {
    const userId: string = req.user.id;
    return this.actionsService.getUserBlocks(userId);
  }

  @Post('report')
  async reportEntity(@Req() req, @Body() createReportDto: CreateReportDto) {
    const userId: string = req.user.id;
    return await this.actionsService.reportEntity(
      userId,
      createReportDto.reportedId,
      createReportDto.reportedType,
      createReportDto.reason,
    );
  }
}
