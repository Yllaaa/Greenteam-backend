import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dtos/products.dto';
import { MarketType } from '../db/schemas/schema';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
import { ValidateProductMediaInterceptor } from '../common/upload-media/validateProductMedia.interceptor';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('create-product')
  @UseInterceptors(FilesInterceptor('images'), ValidateProductMediaInterceptor)
  async createProductFromUser(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
    @UploadedFiles() images: Express.Multer.File[],
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
      images,
    });
  }

  @Get('products')
  async getAllProducts(@Query() query: GetAllProductsDto) {
    return this.marketplaceService.getAllProducts(query);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.marketplaceService.getProductById(id);
  }
}
