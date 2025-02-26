import { Injectable } from '@nestjs/common';
import { SuggestionsRepository } from './suggestions.repository';

@Injectable()
export class SuggestionsService {
    constructor(
        private readonly suggestionsRepository: SuggestionsRepository
    ) { }

    async getPagesSuggestions(userId: string, offset: number, limit: number) {
        return await this.suggestionsRepository.getPagesSuggestions(userId, offset, limit);
    }

    async getGroupsSuggestions(userId: string, offset: number, limit: number) {
        return await this.suggestionsRepository.getGroupsSuggestions(userId, offset, limit);
    }

    async getFolloweesSuggestions(userId: string, offset: number, limit: number) {
        return await this.suggestionsRepository.getFolloweesSuggestions(userId, offset, limit);
    }

    async getFriendsSuggestions(userId: string, offset: number, limit: number) {
        return await this.suggestionsRepository.getFriendsSuggestions(userId, offset, limit);
    }
}
