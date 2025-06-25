import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { users } from 'src/modules/db/schemas/schema';
@Injectable()
export class SettingsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async setUserFcmtoken(userId: string, fcmToken: string) {
    return await this.drizzleService.db
      .update(users)
      .set({ fcmToken })
      .where(eq(users.id, userId));
  }

  async removeUserFcmToken(userId: string) {
    return await this.drizzleService.db
      .update(users)
      .set({ fcmToken: null })
      .where(eq(users.id, userId));
  }

  async updateUserLanguagePreference(
    userId: string,
    languagePreference: 'en' | 'es',
  ) {
    return await this.drizzleService.db
      .update(users)
      .set({ languagePreference })
      .where(eq(users.id, userId));
  }
}
