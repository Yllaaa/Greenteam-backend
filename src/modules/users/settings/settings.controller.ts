import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { SetFcmTokenDto } from './dto/set-fcm-token.dto';
import { UpdateLanguagePreferenceDto } from './dto/update-language-preference.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('fcm-token')
  async setUserFcmToken(@Request() req, @Body() dto: SetFcmTokenDto) {
    const userId = req.user.id;
    console.log(userId);
    return await this.settingsService.setUserFcmtoken(userId, dto.fcmToken);
  }

  @Delete('fcm-token')
  async removeUserFcmToken(@Request() req) {
    const userId = req.user.id;
    return await this.settingsService.removeUserFcmToken(userId);
  }

  @Patch('language')
  async updateUserLanguage(
    @Request() req,
    @Body() dto: UpdateLanguagePreferenceDto,
  ) {
    const userId = req.user.id;
    return await this.settingsService.updateUserLanguagePreference(
      userId,
      dto.languagePreference,
    );
  }
}
