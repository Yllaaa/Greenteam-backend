import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    return await this.usersRepository.getMe(userId);
  }

  async getUserById(userId: string) {
    return await this.usersRepository.getUserById(userId);
  }

  async updateUserGoogleId(userId: string, googleId: string) {
    return await this.usersRepository.updateUserGoogleId(userId, googleId);
  }

  async deleteUser(userId: string) {
    return await this.usersRepository.deleteUser(userId);
  }
}
