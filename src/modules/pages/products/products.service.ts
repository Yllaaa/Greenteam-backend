import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonRepository } from 'src/modules/common/common.repository';
import { MarketType, SellerType } from 'src/modules/db/schemas/schema';
import { MarketplaceRepository } from 'src/modules/marketplace/marketplace.repository';
import { PagesService } from '../pages/pages.service';
@Injectable()
export class ProductsService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly commonRepository: CommonRepository,
    private readonly pagesService: PagesService,
  ) {}

  async createProduct(
    data: {
      pageId: string;
      sellerType: SellerType;
      name: string;
      description: string;
      price: number | string;
      marketType: MarketType;
      topicId: number;
    },
    userId: string,
  ) {
    if (data.sellerType != 'page') {
      throw new BadRequestException('Invalid seller type');
    }

    const page = await this.pagesService.getPageMetadata(data.pageId);
    if (!page) {
      throw new BadRequestException('Invalid page ID');
    }
    if (page.ownerId !== userId) {
      throw new BadRequestException(
        'You are not authorized to create a product for this page',
      );
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
      !['local_business', 'value_driven_business'].includes(data.marketType)
    ) {
      throw new BadRequestException('Invalid market type');
    }

    if (data.topicId) {
      const topicExists = await this.commonRepository.topicExists(data.topicId);
      if (!topicExists) {
        throw new BadRequestException('Invalid topic ID');
      }
    }

    if (page.countryId) {
      const countryExists = await this.commonRepository.countryExists(
        page.countryId,
      );
      if (!countryExists) {
        throw new BadRequestException('Invalid country ID');
      }
    }

    if (page.cityId) {
      if (!page.countryId) {
        throw new BadRequestException(
          'Country ID is required when district is specified',
        );
      }

      const districtExists = await this.commonRepository.cityExistsInCountry(
        page.cityId,
        page.countryId,
      );
      if (!districtExists) {
        throw new BadRequestException(
          'Invalid district or district does not belong to the specified country',
        );
      }
    }
    await this.marketplaceRepository.insertProduct({
      ...data,
      sellerId: data.pageId,
      countryId: page.countryId,
      cityId: page.cityId,
    });
    return { message: 'Product created successfully' };
  }
}
