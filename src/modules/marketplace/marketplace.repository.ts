import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { MarketType, products, SellerType } from '../db/schemas/schema';
import { sql } from 'drizzle-orm';

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
}
