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
@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

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
    return { message: 'users.settings.notifications.LANGUAGE_UPDATED' };
  }
}
