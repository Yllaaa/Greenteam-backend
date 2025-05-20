import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import {
  entitiesMedia,
  favoriteProducts,
  MarketType,
  MediaParentType,
  MediaType,
  pages,
  products,
  SellerType,
  users,
} from '../db/schemas/schema';
import { and, eq, SQL, sql } from 'drizzle-orm';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';

@Injectable()
export class MarketplaceRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async insertProduct(data: {
    sellerId: string;
    sellerType: SellerType;
    name: string;
    description: string;
    price: number | string;
    marketType: MarketType;
    topicId: number;
    countryId: number;
    cityId: number;
  }) {
    let priceValue: any = null;
    if (data.price !== null && data.price !== undefined) {
      priceValue = sql`${typeof data.price === 'string' ? data.price : String(data.price)}`;
    }

    const result = await this.drizzleService.db
      .insert(products)
      .values({
        sellerId: data.sellerId,
        sellerType: data.sellerType,
        name: data.name,
        description: data.description,
        price: priceValue,
        cityId: data.cityId,
        countryId: data.countryId,
        topicId: data.topicId,
        marketType: data.marketType,
      })
      .returning({
        id: products.id,
        name: products.name,
      });

    return result[0];
  }

  async insertProductImages(
    images: {
      parentId: string;
      parentType: MediaParentType;
      mediaUrl: string;
      mediaType: MediaType;
    }[],
  ) {
    for (const image of images) {
      const { parentId, parentType, mediaUrl, mediaType } = image;
      const [savedImage] = await this.drizzleService.db
        .insert(entitiesMedia)
        .values({
          parentId,
          parentType,
          mediaUrl,
          mediaType,
        })
        .returning({
          id: entitiesMedia.id,
          mediaUrl: entitiesMedia.mediaUrl,
          mediaType: entitiesMedia.mediaType,
          parentId: entitiesMedia.parentId,
        });
    }
  }

  async getAllProducts(
    query: GetAllProductsDto,
    userId?: string,
    pageId?: string,
  ) {
    const filters: SQL[] = [];
    const { topicId, countryId, cityId, limit, page, marketType, verified } =
      query;

    if (topicId) filters.push(eq(products.topicId, topicId));
    if (countryId) filters.push(eq(products.countryId, countryId));
    if (cityId) filters.push(eq(products.cityId, cityId));
    if (marketType) filters.push(eq(products.marketType, marketType));
    if (pageId) {
      filters.push(eq(products.sellerId, pageId));
      filters.push(eq(products.sellerType, 'page'));
    }

    const offset = Math.max(0, ((page ?? 1) - 1) * (limit ?? 10));

    // Build query options
    const queryOptions = this.buildProductQueryOptions(
      filters,
      userId,
      false,
      limit,
      offset,
    );

    queryOptions.orderBy = (products, { desc }) => [desc(products.createdAt)];

    let result;
    if (verified == true) {
      const userVerifiedProducts = await this.drizzleService.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.sellerType, 'user'),
            eq(users.isVerified, true),
            ...filters,
          ),
        )
        .innerJoin(users, eq(products.sellerId, users.id))
        .limit(limit ?? 10)
        .offset(offset);

      const pageVerifiedProducts = await this.drizzleService.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.sellerType, 'page'),
            eq(pages.isVerified, true),
            ...filters,
          ),
        )
        .innerJoin(pages, eq(products.sellerId, pages.id))
        .limit(limit ?? 10)
        .offset(offset);

      // Combine and sort the results
      result = [...userVerifiedProducts, ...pageVerifiedProducts]
        .sort(
          (a, b) =>
            new Date(b.products.createdAt).getTime() -
            new Date(a.products.createdAt).getTime(),
        )
        .slice(0, limit ?? 10)
        .map((item) => item.products);
    } else {
      result =
        await this.drizzleService.db.query.products.findMany(queryOptions);
    }

    return result;
  }
  async getProductById(id: string, userId?: string): Promise<Product> {
    const filters = [eq(products.id, id)];

    const queryOptions = this.buildProductQueryOptions(filters, userId, true);

    const result =
      await this.drizzleService.db.query.products.findFirst(queryOptions);
    return result as unknown as Product;
  }

  async deleteProduct(id: string, userId: string) {
    return await this.drizzleService.db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.sellerId, userId)));
  }

  async favoriteProduct(userId: string, productId: string) {
    const result = await this.drizzleService.db
      .insert(favoriteProducts)
      .values({
        userId,
        productId,
      })
      .returning({
        userId: favoriteProducts.userId,
        productId: favoriteProducts.productId,
      });

    return result[0];
  }
  async unfavoriteProduct(userId: string, productId: string) {
    const result = await this.drizzleService.db
      .delete(favoriteProducts)
      .where(
        and(
          eq(favoriteProducts.userId, userId),
          eq(favoriteProducts.productId, productId),
        ),
      )
      .returning({
        id: favoriteProducts.id,
        userId: favoriteProducts.userId,
        productId: favoriteProducts.productId,
      });

    return result[0];
  }

  async getUserFavoriteProduct(userId: string, productId: string) {
    return await this.drizzleService.db.query.favoriteProducts.findFirst({
      columns: {
        id: true,
        userId: true,
        productId: true,
      },

      where: and(
        eq(favoriteProducts.userId, userId),
        eq(favoriteProducts.productId, productId),
      ),
    });
  }

  private buildProductQueryOptions(
    filters: SQL[] = [],
    userId?: string,
    includeSellerDetails = false,
    limit?: number,
    offset?: number,
  ) {
    const queryOptions: any = {
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        marketType: true,
        sellerId: true,
        sellerType: true,
        countryId: true,
        cityId: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
        images: {
          columns: {
            id: true,
            mediaUrl: true,
            mediaType: true,
          },
        },
      },
      where: filters.length ? and(...filters) : undefined,
    };

    if (limit !== undefined) {
      queryOptions.limit = limit;
    }

    if (offset !== undefined) {
      queryOptions.offset = offset;
    }

    if (includeSellerDetails) {
      queryOptions.with = {
        ...queryOptions.with,
        userSeller: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        pageSeller: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      };
    }

    // Add favorites check if userId is provided
    if (userId) {
      queryOptions.extras = (products, { sql }) => ({
        isFavorited: sql<boolean>`
        EXISTS (
          SELECT 1 FROM favorite_products
          WHERE favorite_products.product_id = ${products.id}
            AND favorite_products.user_id = ${userId}
        )
      `.as('is_favorited'),
      });
    }

    return queryOptions;
  }
}
