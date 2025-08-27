import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class UsersRepository {
  constructor(private drizzleService: DrizzleService) {}

  async getMe(userId: string) {
    return await this.drizzleService.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async getUserById(id: string) {
    return await this.drizzleService.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        fullName: true,
        username: true,
        avatar: true,
        cover: true,
        bio: true,
        languagePreference: true,
        fcmToken: true,
        joinedAt: true,
      },
    });
  }

  async updateUserGoogleId(userId: string, googleId: string) {
    return await this.drizzleService.db
      .update(users)
      .set({ googleId, isEmailVerified: true })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string) {
    return await this.drizzleService.db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async deactivateUser(userId: string) {
    return await this.drizzleService.db
      .update(users)
      .set({ status: 'DEACTIVATED', deactivatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
