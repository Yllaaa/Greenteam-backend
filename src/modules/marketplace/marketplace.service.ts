import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly commonRepository: CommonRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly i18n: I18nService,
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
    const translatedMessage = await this.i18n.t(
      'pages.products.notifications.PRODUCT_CREATED',
    );
    return { message: translatedMessage };
  }

  async getAllProducts(query: GetAllProductsDto, userId: string) {
    const products = await this.marketplaceRepository.getAllProducts(
      query,
      userId,
    );
    return products.map((product) => ({
      ...product,
      isAuthor: product.sellerId === userId,
    }));
  }

  async getProductById(productId: string, userId: string) {
    const product = await this.marketplaceRepository.getProductById(
      productId,
      userId,
    );
    if (!product) {
      throw new BadRequestException('pages.products.errors.PRODUCT_NOT_FOUND');
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
  async toggleFavoriteProduct(userId: string, productId: string) {
    const product = await this.marketplaceRepository.getProductById(
      productId,
      userId,
    );
    if (!product) {
      throw new BadRequestException('pages.products.errors.PRODUCT_NOT_FOUND');
    }
    const existingFavorite =
      await this.marketplaceRepository.getUserFavoriteProduct(
        userId,
        productId,
      );

    if (existingFavorite) {
      await this.marketplaceRepository.unfavoriteProduct(userId, productId);
      return {
        isFavorited: false,
        productId,
        userId,
      };
    } else {
      const newFavorite = await this.marketplaceRepository.favoriteProduct(
        userId,
        productId,
      );
      return {
        isFavorited: true,
        ...newFavorite,
      };
    }
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await this.marketplaceRepository.getProductById(
      productId,
      userId,
    );
    if (!product) {
      throw new NotFoundException('pages.products.errors.PRODUCT_NOT_FOUND');
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException(
        'pages.products.errors.UNAUTHORIZED_PRODUCT_DELETE',
      );
    }
    await this.marketplaceRepository.deleteProduct(productId, userId);
    const translatedMessage = await this.i18n.t(
      'pages.products.notifications.PRODUCT_DELETED',
    );
    return { message: translatedMessage };
  }

  private validateSellerType(sellerType: SellerType) {
    if (sellerType !== 'user') {
      throw new BadRequestException(
        'pages.products.errors.INVALID_SELLER_TYPE',
      );
    }
  }

  private validatePrice(price: number | string) {
    if (price !== undefined && price !== null) {
      const numeric = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numeric) || numeric < 0) {
        throw new BadRequestException('pages.products.errors.INVALID_PRICE');
      }
    }
  }

  private async validateLocation(
    topicId: number,
    countryId: number,
    cityId: number,
  ) {
    if (topicId) {
      const exists = await this.commonRepository.topicExists(topicId);
      if (!exists)
        throw new BadRequestException('pages.products.errors.INVALID_TOPIC_ID');
    }

    if (countryId) {
      const exists = await this.commonRepository.countryExists(countryId);
      if (!exists)
        throw new BadRequestException('pages.products.errors.INVALID_TOPIC_ID');
    }

    if (cityId) {
      if (!countryId) {
        throw new BadRequestException('pages.products.errors.COUNTRY_REQUIRED');
      }
      const exists = await this.commonRepository.cityExistsInCountry(
        cityId,
        countryId,
      );
      if (!exists) {
        throw new BadRequestException('pages.products.errors.INVALID_DISTRICT');
      }
    }
  }
}
