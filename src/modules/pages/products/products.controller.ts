import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { GetPageProductsDto } from './dtos/get-page-products';
@UseGuards(JwtAuthGuard)
@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create-product')
  async createProductFromUser(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
    @Param('slug') slug: string,
  ) {
    const userId = request.user.id;
    const sellerType = 'page';

    return this.productsService.createProduct(
      {
        ...createProductDto,
        sellerType,
        slug,
      },
      userId,
    );
  }

  @Get('')
  async getPageProducts(
    @Query() getPageProductsDto: GetPageProductsDto,
    @Param('slug') slug: string,
  ) {
    return this.productsService.getPageProducts(getPageProductsDto, slug);
  }
}
