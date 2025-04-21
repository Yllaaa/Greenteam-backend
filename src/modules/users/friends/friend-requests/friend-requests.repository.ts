// import { Injectable } from "@nestjs/common";
// import { and, eq, or } from "drizzle-orm";
// import { union } from "drizzle-orm/pg-core";
// import { DrizzleService } from "src/modules/db/drizzle.service";
// import { friendRequests, friends } from "src/modules/db/schemas/schema";

// @Injectable()
// export class FriendRequestsRepository {
//     constructor(
//         private readonly drizzleService: DrizzleService
//     ) { }

//     async postRequest(req: typeof friendRequests.$inferInsert) {
//         return await this.drizzleService.db.insert(friendRequests).values(req).returning();
//     }

//     async getReceivedRequests(userId: string, offset: number, limit: number) {
//         return await this.drizzleService.db.query.friendRequests.findMany({
//             where: eq(friendRequests.receiverId, userId),
//             columns: {
//                 id: true,
//                 status: true
//             },
//             with: {
//                 sender: {
//                     columns: {
//                         id: true,
//                         fullName: true,
//                         avatar: true
//                     }
//                 }
//             },
//             offset: offset,
//             limit: limit
//         });
//     }

//     async updateRequest(userId: string, reqId: string, status: 'accepted' | 'declined') {
//         return await this.drizzleService.db.update(friendRequests)
//             .set({
//                 status: status
//             })
//             .where(and(eq(friendRequests.receiverId, userId), eq(friendRequests.id, reqId), eq(friendRequests.status, 'pending')))
//             .returning();
//     }

//     async getFriendship(userId: string, friendId: string) {
//         return await union(
//             this.drizzleService.db.select({ id: friendRequests.id }).from(friendRequests).where(
//                 or(
//                     and(eq(friendRequests.receiverId, userId), eq(friendRequests.senderId, friendId)),
//                     and(eq(friendRequests.receiverId, friendId), eq(friendRequests.senderId, userId))
//                 )
//             ),
//             this.drizzleService.db.select({ id: friends.id }).from(friends).where(
//                 or(
//                     and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
//                     and(eq(friends.userId, friendId), eq(friends.friendId, userId))
//                 )
//             )
//         )
//     }
// }
