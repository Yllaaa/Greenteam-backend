import { BadRequestException, Injectable } from '@nestjs/common';
import { MarketplaceRepository } from './marketplace.repository';
import { CommonRepository } from '../common/common.repository';
import { MarketType, SellerType } from '../db/schemas/schema';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly commonRepository: CommonRepository,
  ) {}

  async createProduct(data: {
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
    if (!['user', 'page'].includes(data.sellerType)) {
      throw new BadRequestException('Invalid seller type');
    }

    if (data.price !== undefined && data.price !== null) {
      const numericPrice =
        typeof data.price === 'string' ? parseFloat(data.price) : data.price;

      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new BadRequestException('Price must be a valid positive number');
      }
    }

    if (
      data.marketType &&
      !['local_business', 'value_driven_business', 'second_hand'].includes(
        data.marketType,
      )
    ) {
      throw new BadRequestException('Invalid market type');
    }

    if (data.topicId) {
      const topicExists = await this.commonRepository.topicExists(data.topicId);
      if (!topicExists) {
        throw new BadRequestException('Invalid topic ID');
      }
    }

    if (data.countryId) {
      const countryExists = await this.commonRepository.countryExists(
        data.countryId,
      );
      if (!countryExists) {
        throw new BadRequestException('Invalid country ID');
      }
    }

    if (data.districtId) {
      if (!data.countryId) {
        throw new BadRequestException(
          'Country ID is required when district is specified',
        );
      }

      const districtExists = await this.commonRepository.cityExistsInCountry(
        data.districtId,
        data.countryId,
      );
      if (!districtExists) {
        throw new BadRequestException(
          'Invalid district or district does not belong to the specified country',
        );
      }
    }
    await this.marketplaceRepository.insertProduct(data);
    return { message: 'Product created successfully' };
  }

  async getAllProducts(query: GetAllProductsDto) {
    return this.marketplaceRepository.getAllProducts(query);
  }

  async getProductById(productId: string) {
    const product = await this.marketplaceRepository.getProductById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return {
      ...product,
      seller: {
        id: product.sellerId,
        name:
          product.sellerType === 'user'
            ? product?.userSeller?.fullName
            : product?.pageSeller?.name,
        avatar:
          product.sellerType === 'user'
            ? product?.userSeller?.avatar
            : product?.pageSeller?.avatar,
      },
      userSeller: undefined,
      pageSeller: undefined,
    };
  }
}
