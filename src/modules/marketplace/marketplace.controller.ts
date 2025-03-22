import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dtos/products.dto';
import { MarketType } from '../db/schemas/schema';

@UseGuards(JwtAuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('user-create-product')
  async createProductFromUser(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
  ) {
    const userId = request.user.id;
    const sellerId = userId;
    const sellerType = 'user';
    const marketType = 'second_hand' as MarketType;

    return this.marketplaceService.createProduct({
      ...createProductDto,
      sellerId,
      sellerType,
      marketType,
    });
  }
}
