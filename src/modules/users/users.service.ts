import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    return await this.usersRepository.getMe(userId);
  }

  async deleteUser(userId: string) {
    return await this.usersRepository.deleteUser(userId);
  }
}
