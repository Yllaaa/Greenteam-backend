import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { MarketType, products, SellerType } from '../db/schemas/schema';
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
    districtId: number;
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
        districtId: data.districtId,
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

  async getAllProducts(query: GetAllProductsDto) {
    const filters: SQL[] = [];
    const { topicId, countryId, districtId, limit, page } = query;
    if (topicId) {
      filters.push(eq(products.topicId, topicId));
    }
    if (countryId) {
      filters.push(eq(products.countryId, countryId));
    }
    if (districtId) {
      filters.push(eq(products.districtId, districtId));
    }
    const offset = Math.max(0, ((page ?? 1) - 1) * (limit ?? 10));
    const result = await this.drizzleService.db.query.products.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        marketType: true,
        sellerId: true,
        sellerType: true,
        countryId: true,
        districtId: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      where: filters.length ? and(...filters) : undefined,
      limit,
      offset,
    });

    return result;
  }

  async getProductById(id: string): Promise<Product> {
    const result = await this.drizzleService.db.query.products.findFirst({
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        marketType: true,
        sellerId: true,
        sellerType: true,
        countryId: true,
        districtId: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
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
      },
      where: eq(products.id, id),
    });

    return result as unknown as Product;
  }
}
