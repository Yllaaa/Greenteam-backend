import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly i18n: I18nService
  ) { }

  async setUserFcmtoken(userId: string, fcmToken: string) {
    return await this.settingsRepository.setUserFcmtoken(userId, fcmToken);
  }

  async removeUserFcmToken(userId: string) {
    return await this.settingsRepository.removeUserFcmToken(userId);
  }

  async updateUserLanguagePreference(
    userId: string,
    languagePreference: 'en' | 'es',
  ) {
    await this.settingsRepository.updateUserLanguagePreference(
      userId,
      languagePreference,
    );
    const translatedMessage = await this.i18n.t('users.settings.notifications.LANGUAGE_UPDATED');
    return { message: translatedMessage };
  }
}
