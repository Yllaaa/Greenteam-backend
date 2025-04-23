import { BadRequestException, Injectable } from '@nestjs/common';
import { FollowersRepository } from './Followers.repository';

@Injectable()
export class FollowersService {
  constructor(private readonly followersRepository: FollowersRepository) {}

  async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('Users cannot follow themselves');
    }

    const isFollowing = await this.followersRepository.isFollowing(
      followerId,
      followingId,
    );

    if (isFollowing) {
      await this.followersRepository.unfollow(followerId, followingId);
      return { following: false };
    } else {
      await this.followersRepository.follow(followerId, followingId);
      return { following: true };
    }
  }
}
