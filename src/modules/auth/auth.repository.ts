import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../database/entities/users/users.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(field: 'email' | 'username', value: string) {
    const user = await this.userRepository.findOne({
      where: { [field]: value },
      select: [
        'id',
        'email',
        'password',
        'fullName',
        'username',
        'avatar',
        'bio',
        'isEmailVerified',
      ],
    });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'username', 'avatar', 'bio'],
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'googleId', 'isEmailVerified'],
    });
  }

  async getUserByUsername(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'email', 'fullName', 'googleId'],
    });
  }

  async createUser(newUser) {
    const createdUser = this.userRepository.create({
      email: newUser.email,
      password: newUser.password,
      username:
        newUser.username ?? (newUser.email ? newUser.email.split('@')[0] : ''),
      fullName: newUser.fullName ?? newUser.email?.split('@')[0] ?? '',
      avatar: newUser.avatar ?? null,
      googleId: newUser.googleId ?? null,
      isEmailVerified: newUser.isEmailVerified ?? false,
      verificationToken: newUser.verificationToken ?? uuidv4(),
    });

    return await this.userRepository.save(createdUser);
  }

  async checkUserVerification(token: string) {
    return await this.userRepository.findOne({
      where: { verificationToken: token },
    });
  }

  async verifyEmail(userId: string) {
    await this.userRepository.update(userId, {
      isEmailVerified: true,
      verificationToken: undefined,
    });

    return await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'username', 'isEmailVerified'],
    });
  }

  async resendVerificationEmail(email: string, verificationToken: string) {
    await this.userRepository.update({ email }, { verificationToken });
    return { message: 'Verification email sent' };
  }

  async forgotPassword(id: string, hashedToken: string, resetExpires: Date) {
    await this.userRepository.update(id, {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: resetExpires,
    });
  }

  async getUserByResetToken(hashedToken: string) {
    return await this.userRepository.findOne({
      where: { passwordResetToken: hashedToken },
    });
  }

  async resetPassword(id: string, hashedPassword: string) {
    await this.userRepository.update(id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetTokenExpires: undefined,
    });

    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username'],
    });
  }
}
