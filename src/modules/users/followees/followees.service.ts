import { Injectable } from "@nestjs/common";
import { FolloweesRepository } from "./followees.repository";

@Injectable()
export class FolloweesService {
    constructor(
        private readonly followeesRepository: FolloweesRepository
    ) { }


    async getFollowees(userId: string, offset: number, limit: number) {
        return await this.followeesRepository.getFollowees(userId, offset, limit);
    }

    async addFollowee(userId: string, followeeId: string) {
        return await this.followeesRepository.addFollowee(userId, followeeId);
    }

    async deleteFollowee(userId: string, followeeId: string) {
        return await this.followeesRepository.deleteFollowee(userId, followeeId);
    }
}