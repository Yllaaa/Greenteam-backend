import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ProfileRepository } from './profile/profile.repository';
@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private profileRepository: ProfileRepository,
  ) {}

  async getMe(userId: string) {
    const userScore = await this.profileRepository.getUserScore(userId);
    const userData = await this.usersRepository.getMe(userId);
    return {
      ...userData,
      userScore,
    };
  }

  async getUserById(userId: string) {
    return await this.usersRepository.getUserById(userId);
  }

  async updateUserGoogleId(userId: string, googleId: string) {
    return await this.usersRepository.updateUserGoogleId(userId, googleId);
  }

  async updateUserAppleId(userId: string, appleId: string) {
    return await this.usersRepository.updateUserAppleId(userId, appleId);
  }

  async deleteUser(userId: string) {
    return await this.usersRepository.deleteUser(userId);
  }

  async deactivateUser(userId: string) {
    return await this.usersRepository.deactivateUser(userId);
  }
}
