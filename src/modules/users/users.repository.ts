import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class UsersRepository {
  constructor(private drizzle: DrizzleService) {}

  async getMe(userId: string) {
    return await this.drizzle.db.query.users.findFirst({
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

  async deleteUser(userId: string) {
    return await this.drizzle.db.delete(users).where(eq(users.id, userId));
  }
}
