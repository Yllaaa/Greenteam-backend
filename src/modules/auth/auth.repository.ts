import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schemas/users';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthRepository {
  constructor(private drizzle: DrizzleService) {}

  async validateUser(field: 'email' | 'username', value: string) {
    return await this.drizzle.db.query.users.findFirst({
      where: eq(users[field], value),
      columns: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.drizzle.db.query.users.findMany({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        fullName: true,
        googleId: true,
      },
    });
  }

  async createUser(newUser: any) {
    await this.drizzle.db
      .insert(users)
      .values({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
        fullName: newUser.username,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });
  }
}
