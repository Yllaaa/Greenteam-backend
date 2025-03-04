import { Injectable } from "@nestjs/common";
import { FriendsRepository } from "./friends.repository";

@Injectable()
export class FriendsService {
    constructor(
        private readonly friendsRepository: FriendsRepository
    ) { }

    async getFriends(userId: string, offset: number, limit: number) {
        return await this.friendsRepository.getFriends(userId, offset, limit);
    }

    async deleteFriend(userId: string, friendId: string) {
        return await this.friendsRepository.deleteFriend(userId, friendId);
    }
}