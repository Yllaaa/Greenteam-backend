import { Injectable } from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';
@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async getUserLikedPosts(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getUserLikedPosts(userId, pagination);
  }

  async getUserFollowingsPosts(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getFollowingsPosts(userId, pagination);
  }

  async getFollowedPagesPosts(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getFollowedPagesPosts(userId, pagination);
  }

  async getJoinedGroupsPosts(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getJoinedGroupsPosts(userId, pagination);
  }

  async getFollowedPages(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getFollowedPages(userId, pagination);
  }

  async getUserJoinedGroups(
    userId: string,
    pagination?: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.favoritesRepository.getUserJoinedGroups(userId, pagination);
  }

  async getUserJoinedEvents(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    const events = await this.favoritesRepository.getJoinedEvents(
      userId,
      pagination,
    );

    return await Promise.all(
      events.map(async (event) => {
        const hostName = await this.GetEventHostName(event);
        const { userCreator, pageCreator, ...rest } = event;

        return {
          ...rest,
          hostName,
        };
      }),
    );
  }

  async getUserFavoriteProducts(
    userId: string,
    pagination?: { limit?: number; page?: number },
  ) {
    return this.favoritesRepository.getUserFavoriteProducts(userId, pagination);
  }

  private async GetEventHostName(event) {
    const hostedByStr = String(event.hostedBy);

    if (hostedByStr === 'Greenteam') {
      return 'Greenteam';
    } else if (hostedByStr === 'Global') {
      return 'Global';
    }

    return (
      event?.userCreator?.fullName || event?.pageCreator?.name || 'Community'
    );
  }
}
