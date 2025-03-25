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
@UseGuards(JwtAuthGuard)
@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':pageId/create-product')
  async createProductFromUser(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
    @Param('pageId') pageId: string,
  ) {
    const userId = request.user.id;
    const sellerType = 'page';

    return this.productsService.createProduct(
      {
        ...createProductDto,
        sellerType,
        pageId,
      },
      userId,
    );
  }
}
