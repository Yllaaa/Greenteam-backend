import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { users } from '../../db/schemas/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class ProfileRepository {
  constructor(private drizzle: DrizzleService) {}

  async getUserByUsername(username: string) {
    return await this.drizzle.db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        bio: true,
        joinedAt: true,
      },
    });
  }


  async updateProfile(userId: string, updateData: Partial<typeof users.$inferInsert>) {
    // Ensure only specific fields can be updated
    const allowedFields = {
      fullName: updateData.fullName,
      bio: updateData.bio,
      avatar: updateData.avatar,
    };

    return await this.drizzle.db
      .update(users)
      .set({
        ...allowedFields,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        bio: users.bio,
        avatar: users.avatar,
      });
  }
}
