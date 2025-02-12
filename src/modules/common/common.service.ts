import { Injectable } from '@nestjs/common';
import { CommonRepository } from './common.repository';
@Injectable()
export class CommonService {
  constructor(private readonly commonRepository: CommonRepository) {}
  async getTopics(mainTopics, query: { tree?: boolean }) {
    if (mainTopics) {
      return await this.commonRepository.getMainTopics();
    }
    return await this.commonRepository.getTopics(query);
  }
}
