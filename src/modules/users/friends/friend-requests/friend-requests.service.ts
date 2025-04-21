// import { ConflictException, Injectable } from "@nestjs/common";
// import { FriendRequestsRepository } from "./friend-requests.repository";
// import { FriendsRepository } from "../friends.repository";

// @Injectable()
// export class FriendRequestsService {
//     constructor(
//         private readonly friendRequestsRepository: FriendRequestsRepository,
//         private readonly friendsRepository: FriendsRepository
//     ) { }

//     async postFriendRequest(userId: string, friendId: string) {
//         if ((await this.friendRequestsRepository.getFriendship(userId, friendId)).length > 0) {
//             throw new ConflictException('Friend request already sent Or already friends');
//         }
//         return await this.friendRequestsRepository.postRequest({ senderId: userId, receiverId: friendId });
//     }

//     async getFriendRequests(userId: string, offset: number, limit: number) {
//         return await this.friendRequestsRepository.getReceivedRequests(userId, offset, limit);
//     }

//     async acceptFriendRequest(userId: string, reqId: string) {
//         const req = (await this.friendRequestsRepository.updateRequest(userId, reqId, 'accepted'))[0];
//         if (req) {
//             return await this.friendsRepository.addFriendship({ userId: req.senderId, friendId: req.receiverId });
//         }
//     }

//     async declineFriendRequest(userId: string, reqId: string) {
//         return await this.friendRequestsRepository.updateRequest(userId, reqId, 'declined');
//     }
// }
