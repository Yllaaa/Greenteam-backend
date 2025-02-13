import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateReactionDto } from './dtos/create-reaction.dto';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
@Controller('')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('toggle-reaction')
  async toggleReaction(@Body() dto: CreateReactionDto, @Req() req) {
    const userId = req.user.id;
    return this.reactionsService.toggleReaction(userId, dto);
  }
}
