import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CommonRepository } from 'src/modules/common/common.repository';
import {
  MarketType,
  MediaParentType,
  MediaType,
  SellerType,
} from 'src/modules/db/schemas/schema';
import { MarketplaceRepository } from 'src/modules/marketplace/marketplace.repository';
import { PagesService } from '../pages/pages.service';
import { GetAllProductsDto } from 'src/modules/marketplace/dtos/getAllProducts.dto';
import { GetPageProductsDto } from './dtos/get-page-products';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
@Injectable()
export class ProductsService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly commonRepository: CommonRepository,
    private readonly pagesService: PagesService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  async createProduct(
    data: {
      slug: string;
      sellerType: SellerType;
      name: string;
      description: string;
      price: number | string;
      marketType: MarketType;
      topicId: number;
      images: Express.Multer.File[];
    },
    userId: string,
  ) {
    if (data.sellerType != 'page') {
      throw new BadRequestException('pages.products.errors.INVALID_SELLER_TYPE');
    }

    const page = await this.pagesService.getPageBySlug(data.slug);

    if (!page) {
      throw new BadRequestException("pages.products.errors.INVALID_PAGE_ID");
    }
    if (page.ownerId !== userId) {
      throw new BadRequestException(
        'pages.products.errors.UNAUTHORIZED_PRODUCT_CREATE',
      );
    }

    if (data.price !== undefined && data.price !== null) {
      const numericPrice =
        typeof data.price === 'string' ? parseFloat(data.price) : data.price;

      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new BadRequestException('pages.products.errors.INVALID_PRICE');
      }
    }

    if (
      data.marketType &&
      !['local_business', 'value_driven_business'].includes(data.marketType)
    ) {
      throw new BadRequestException('pages.products.errors.INVALID_MARKET_TYPE');
    }

    if (data.topicId) {
      const topicExists = await this.commonRepository.topicExists(data.topicId);
      if (!topicExists) {
        throw new BadRequestException('pages.products.errors.INVALID_TOPIC_ID');
      }
    }

    if (page.countryId) {
      const countryExists = await this.commonRepository.countryExists(
        page.countryId,
      );
      if (!countryExists) {
        throw new BadRequestException('pages.products.errors.INVALID_COUNTRY_ID');
      }
    }

    if (page.cityId) {
      if (!page.countryId) {
        throw new BadRequestException(
          'pages.products.errors.COUNTRY_REQUIRED',
        );
      }

      const districtExists = await this.commonRepository.cityExistsInCountry(
        page.cityId,
        page.countryId,
      );
      if (!districtExists) {
        throw new BadRequestException(
          'pages.products.errors.INVALID_DISTRICT',
        );
      }
    }
    const newProduct = await this.marketplaceRepository.insertProduct({
      ...data,
      sellerId: page.id,
      countryId: page.countryId,
      cityId: page.cityId,
    });
    if (data.images && data.images.length > 0) {
      const uploadedImages = await this.uploadMediaService.uploadFilesToS3(
        { images: data.images, audio: [], document: [] },
        'products',
      );
      const images = uploadedImages.images.map((image) => ({
        parentId: newProduct.id,
        parentType: 'product' as MediaParentType,
        mediaUrl: image.location,
        mediaType: 'image' as MediaType,
      }));
      await this.marketplaceRepository.insertProductImages(images);
    }
    return { message: 'pages.products.notifications.PRODUCT_CREATED' };
  }

  async getPageProducts(
    query: GetPageProductsDto,
    slug: string,
    userId: string,
  ) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.products.errors.PAGE_NOT_FOUND');
    }

    const products = await this.marketplaceRepository.getAllProducts(
      query,
      userId,
      page.id,
    );
    return products.map((product) => ({
      ...product,
      isAuthor: page.ownerId === userId,
    }));
  }

  async deleteProduct(productId: string, slug: string, userId: string) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new BadRequestException('pages.products.errors.INVALID_PAGE_SLUG');
    }

    const product = await this.marketplaceRepository.getProductById(productId);
    if (!product) {
      throw new NotFoundException('pages.products.errors.PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== page.id || page.ownerId !== userId) {
      throw new ForbiddenException(
        'pages.products.errors.UNAUTHORIZED_PRODUCT_DELETE',
      );
    }

    await this.marketplaceRepository.deleteProduct(productId, page.id);
    return { message: 'pages.products.notifications.PRODUCT_DELETED' };
  }
}
