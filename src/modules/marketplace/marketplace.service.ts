import { BadRequestException, Injectable } from '@nestjs/common';
import { MarketplaceRepository } from './marketplace.repository';
import { CommonRepository } from '../common/common.repository';
import {
  MarketType,
  MediaParentType,
  MediaType,
  SellerType,
} from '../db/schemas/schema';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
import { UploadMediaService } from '../common/upload-media/upload-media.service';
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly commonRepository: CommonRepository,
    private readonly uploadMediaService: UploadMediaService,
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
    cityId: number;
    images: Express.Multer.File[];
  }) {
    this.validateSellerType(data.sellerType);
    this.validatePrice(data.price);
    this.validateMarketType(data.marketType);

    await this.validateLocation(data.topicId, data.countryId, data.cityId);

    const newProduct = await this.marketplaceRepository.insertProduct(data);

    if (data.images?.length) {
      const uploadedImages = await this.uploadMediaService.uploadFilesToS3(
        { images: data.images, audio: [], document: [] },
        'products',
      );

      const imageRecords = uploadedImages.images.map((img) => ({
        parentId: newProduct.id,
        parentType: 'product' as MediaParentType,
        mediaUrl: img.location,
        mediaType: 'image' as MediaType,
      }));

      await this.marketplaceRepository.insertProductImages(imageRecords);
    }

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

  private validateSellerType(sellerType: SellerType) {
    if (sellerType !== 'user') {
      throw new BadRequestException('Invalid seller type');
    }
  }

  private validatePrice(price: number | string) {
    if (price !== undefined && price !== null) {
      const numeric = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numeric) || numeric < 0) {
        throw new BadRequestException('Price must be a valid positive number');
      }
    }
  }

  private validateMarketType(marketType: string) {
    const valid = ['local_business', 'value_driven_business', 'second_hand'];
    if (marketType && !valid.includes(marketType)) {
      throw new BadRequestException('Invalid market type');
    }
  }

  private async validateLocation(
    topicId: number,
    countryId: number,
    cityId: number,
  ) {
    if (topicId) {
      const exists = await this.commonRepository.topicExists(topicId);
      if (!exists) throw new BadRequestException('Invalid topic ID');
    }

    if (countryId) {
      const exists = await this.commonRepository.countryExists(countryId);
      if (!exists) throw new BadRequestException('Invalid country ID');
    }

    if (cityId) {
      if (!countryId) {
        throw new BadRequestException(
          'Country ID is required when district is specified',
        );
      }
      const exists = await this.commonRepository.cityExistsInCountry(
        cityId,
        countryId,
      );
      if (!exists) {
        throw new BadRequestException(
          'Invalid district or district does not belong to the specified country',
        );
      }
    }
  }
}
