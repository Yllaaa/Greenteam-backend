import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schemas/users';
import { eq } from 'drizzle-orm';
import { User } from './interfaces/user.interface';

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

  async getUserById(id: string): Promise<User> {
    const user = await this.drizzle.db.query.users.findMany({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });
    return user as unknown as User;
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

  async getUserByUsername(username: string) {
    return await this.drizzle.db.query.users.findMany({
      where: eq(users.username, username),
      columns: {
        id: true,
        email: true,
        fullName: true,
        googleId: true,
      },
    });
  }

  async createUser(newUser: any) {
    const createdUser = await this.drizzle.db
      .insert(users)
      .values({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username
          ? newUser.username
          : newUser.email.split('@')[0],
        fullName: newUser.fullName
          ? newUser.fullName
          : newUser.email.split('@')[0],
        avatar: newUser.avatar ?? null,
        googleId: newUser.googleId ?? null,
        isEmailVerified: newUser.isEmailVerified ?? false,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        googleId: users.googleId,
      });

    return createdUser;
  }
}
