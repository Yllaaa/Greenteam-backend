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
  Delete,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dtos/products.dto';
import { MarketType } from '../db/schemas/schema';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
import { ValidateProductMediaInterceptor } from '../common/upload-media/interceptors/validateProductMedia.interceptor';
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

    return this.marketplaceService.createProduct({
      ...createProductDto,
      sellerId,
      sellerType,
      images,
    });
  }

  @Get('products')
  async getAllProducts(@Query() query: GetAllProductsDto, @Req() req) {
    const userId = req.user.id;
    return this.marketplaceService.getAllProducts(query, userId);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.marketplaceService.getProductById(id, userId);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.marketplaceService.deleteProduct(id, userId);
  }

  @Post('products/:productId/toggle-favorite')
  async toggleFavorite(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.marketplaceService.toggleFavoriteProduct(userId, productId);
  }
}
