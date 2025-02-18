import { Injectable } from "@nestjs/common";
import { FriendRequestsRepository } from "./friend-requests.repository";
import { FriendsRepository } from "../friends.repository";

@Injectable()
export class FriendRequestsService {
    constructor(
        private readonly friendRequestsRepository: FriendRequestsRepository,
    ) { }


    async postFriendRequest(userId: string, friendId: string) {
        if ((await this.friendRequestsRepository.getFriendship(userId, friendId)).length > 0) {
            throw new Error('Friend request already sent Or already friends');
        }
        return await this.friendRequestsRepository.postRequest({ senderId: userId, receiverId: friendId });
    }

    async getFriendRequests(userId: string) {
        return await this.friendRequestsRepository.getReceivedRequests(userId);
    }

    async acceptFriendRequest(userId: string, reqId: string) {
        return await this.friendRequestsRepository.updateRequest(userId, reqId, 'accepted');
    }

    async declineFriendRequest(userId: string, reqId: string) {
        return await this.friendRequestsRepository.updateRequest(userId, reqId, 'declined');
    }
}