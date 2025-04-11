import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schemas/users/users';
import { eq, is } from 'drizzle-orm';
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
        isEmailVerified: true,
      },
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.drizzle.db.query.users.findFirst({
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

  async getUserByEmail(email: string): Promise<User> {
    const user = this.drizzle.db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        googleId: true,
        isEmailVerified: true,
      },
    });
    return user as unknown as User;
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

  async createUser(newUser: any): Promise<User> {
    const createdUser = await this.drizzle.db
      .insert(users)
      .values({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
        fullName: newUser.fullName
          ? newUser.fullName
          : newUser.email.split('@')[0],
        avatar: newUser.avatar ?? null,
        googleId: newUser.googleId ?? null,
        isEmailVerified: newUser.isEmailVerified ?? false,
        verificationToken: newUser.verificationToken ?? null,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        googleId: users.googleId,
        isEmailVerified: users.isEmailVerified,
      });

    return createdUser as unknown as User;
  }

  // email verification

  async checkUserVerification(token: string) {
    const user = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);
    return user[0];
  }

  async verifyEmail(userId) {
    return await this.drizzle.db
      .update(users)
      .set({
        isEmailVerified: true,
        verificationToken: null,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
        isEmailVerified: users.isEmailVerified,
      });
  }

  async resendVerificationEmail(email: string, verificationToken: string) {
    await this.drizzle.db
      .update(users)
      .set({ verificationToken })
      .where(eq(users.email, email));
    return { message: 'Verification email sent' };
  }

  async forgotPassword(
    id: string,
    hashedToken: string | null,
    resetExpires: Date | null,
  ) {
    await this.drizzle.db
      .update(users)
      .set({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: resetExpires,
      })
      .where(eq(users.id, id));
  }

  async getUserByResetToken(hashedToken: string) {
    return await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, hashedToken))
      .limit(1);
  }

  async resetPassword(id: string, hashedPassword: string) {
    return await this.drizzle.db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
      });
  }
}
